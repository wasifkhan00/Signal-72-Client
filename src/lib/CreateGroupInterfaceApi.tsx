import useCreateGroupStore from "@store/CreateGroupInterfaceStore";
import { AuthStore } from "@store/AuthStore";
import Endpoints from "../endpoint/endpoints";
import axios from "axios";
import sockets from "../websockets/websockets";
import useChatStore, { GroupChat, PrivateChat } from "@store/ChatStore";
import { table } from "console";

export const checkIfUserAlreadyCreatedGroup = async () => {
  try {
    const response = await axios.get(Endpoints.fetchExistingGroups, {
      headers: Endpoints.getHeaders(),
    });

    const { groupsCreatorUsers, success } = response.data;

    if (
      success &&
      Array.isArray(groupsCreatorUsers) &&
      groupsCreatorUsers.length > 0
    ) {
      const store = useCreateGroupStore.getState();
      const current = store.everyUserGroupInfoEmail;
      const updated = Array.from(new Set([...current, ...groupsCreatorUsers]));
      store.setEveryUserGroupInfoEmail(updated);
    } else {
      console.log(response.data.message);
    }
  } catch (error) {
    console.log(error);
  }
};

export const findUserByEmail = async () => {
  const store = useCreateGroupStore.getState();
  const input = store.groupMembersInputValue.trim();

  try {
    const response = await axios.post(
      Endpoints.checkUserGroupAffiliations,
      { groupMembersInputValue: input },
      { headers: Endpoints.getHeaders() }
    );
    const { success, groupCreators } = response.data;

    if (success && groupCreators.length > 0) {
      const filteredUsers = groupCreators
        .filter((user: any) =>
          input !== ""
            ? user.emails.toLowerCase().includes(input.toLowerCase())
            : false
        )
        .map((user: any) => ({
          userName: user.names,
          userEmail: user.emails,
          userId: user._id,
        }));

      store.setShowResponsesFromApi(true);
      store.setWarningMsg("");
      store.setGroupMembersResponse(filteredUsers);
      //   return filteredUsers;
    } else {
      store.setWarningMsg("User not found");
    }
  } catch (error) {
    console.log(error);
  }
};

export function usersComponentOnclick(e: React.MouseEvent<HTMLElement>): any {
  const { isModePrivateChat } = useChatStore.getState();
  const chatStore = useChatStore.getState();
  const setSelectedGroupMemberPayload =
    useChatStore.getState().setSelectedGroupMemberPayload;
  const AuthStores = AuthStore.getState();
  const useCreateGroupStores = useCreateGroupStore.getState();
  const target = e.currentTarget as HTMLElement;
  const userId = target.getAttribute("data-user-id");
  const userName = target.getAttribute("data-user-name");
  useCreateGroupStores.setShowResponsesFromApi(false);
  const emails = AuthStores.emailAddress;

  if (userId === AuthStores.emailAddress.toLowerCase()) {
    useCreateGroupStores.setWarningMsg("You cannot add yourself in the group");
    return "failed";
  }

  const alreadyExists =
    chatStore.selectedGroupMemberPayload &&
    chatStore.selectedGroupMemberPayload.length > 0 &&
    chatStore.selectedGroupMemberPayload.some(
      (group: any) => group?.email == userId
    );

  const PayloadMembers: any = [
    {
      email: userId,
      isAdmin: false,
      addedBy: emails,
      userName: userName,
    },
  ];

  const PayloadPrivateChatMembers: any = [
    {
      email: userId,
      userName: userName,
    },
  ];

  if (alreadyExists) {
    useCreateGroupStores.setWarningMsg("User Already Selected");
    setTimeout(() => {
      useCreateGroupStores.setWarningMsg("");
    }, 3000);
    return;
  }

  if (isModePrivateChat) {
    if (chatStore.selectedGroupMemberPayload.length >= 1) {
      useCreateGroupStores.setWarningMsg(
        "You can only select 1 person for Private Chat"
      );
      setTimeout(() => {
        useCreateGroupStores.setWarningMsg("");
      }, 3000);
      return;
    }

    // ✅ Private Chat Mode — allowed to add
    setSelectedGroupMemberPayload([
      ...chatStore.selectedGroupMemberPayload,
      ...PayloadPrivateChatMembers,
    ]);
  } else {
    // ✅ Group Chat Mode — always allow adding
    setSelectedGroupMemberPayload([
      ...chatStore.selectedGroupMemberPayload,
      ...PayloadMembers,
    ]);
  }
}

// handleCreateGroupFunction
export const handleCreateGroup = ({ groupNameInput }: any) => {
  const { emailAddress, name } = AuthStore.getState();
  const {
    setChatList,
    selectedGroupMemberPayload,
    setShowCreateGroupIntf,
    setSelectedGroupMemberPayload,
    chatIdGenerator,
  } = useChatStore.getState();

  const { setWarningMsg, setGroupMembersInputValue } =
    useCreateGroupStore.getState();

  const isAdminAlreadyInGroup =
    selectedGroupMemberPayload && selectedGroupMemberPayload.length > 0
      ? selectedGroupMemberPayload.some(
          (member: any) =>
            member.email === emailAddress && member.isAdmin === true
        )
      : false;

  const updatedMembers = [...selectedGroupMemberPayload];

  const adminPayload: any = [
    {
      email: emailAddress,
      isAdmin: true,
      addedBy: "None",
      userName: name,
    },
  ];

  if (!isAdminAlreadyInGroup) {
    updatedMembers.push(...adminPayload);
    setSelectedGroupMemberPayload([
      ...selectedGroupMemberPayload,
      ...adminPayload,
    ]);
  }

  const groupPayload: GroupChat = {
    type: "group",
    createdBy: emailAddress,
    chatId: chatIdGenerator({ emailAddress: emailAddress }),
    groupNames: groupNameInput.current.value, //This should ideally come from input state
    members: updatedMembers,
  };

  if (groupPayload.groupNames !== "" && groupPayload.members.length > 0) {
    axios
      .post(Endpoints.userCreatedNewGroup, groupPayload, {
        headers: Endpoints.getHeaders(),
      })
      .then((response) => {
        const { success, message } = response.data;
        if (success) {
          setChatList((prevChatList) => [...prevChatList, groupPayload]);
          setShowCreateGroupIntf(false);
          setSelectedGroupMemberPayload([]);
          sockets.emit("chatInitated", emailAddress);
        } else {
          setWarningMsg(message);
        }
      })
      .catch((err) => setWarningMsg(err.message));
    setWarningMsg("");
    setGroupMembersInputValue("");
  } else {
    setWarningMsg("Fields cannot be blank");
    setTimeout(() => {
      setWarningMsg("");
    }, 3000);
  }
};
// handleCreateGroupFunction

// handleCreateContactFunction

export const handleCreateContact = ({ groupNameInput }: any) => {
  const { emailAddress, name } = AuthStore.getState();
  const {
    setChatList,
    setShowCreateGroupIntf,
    setSelectedGroupMemberPayload,
    selectedGroupMemberPayload,
    chatIdGenerator,
    isModePrivateChat,
  } = useChatStore.getState();

  const { setWarningMsg, setGroupMembersInputValue } =
    useCreateGroupStore.getState();

  const isCurrentUserAlreadyInChat =
    selectedGroupMemberPayload && selectedGroupMemberPayload.length > 0
      ? selectedGroupMemberPayload.some(
          (member: any) => member.email === emailAddress
        )
      : false;

  const updatedPrivateMembers = [...selectedGroupMemberPayload];

  const adminPayload: any = {
    email: emailAddress,
    userName: name,
  };

  if (!isCurrentUserAlreadyInChat) {
    updatedPrivateMembers.push(adminPayload);
    setSelectedGroupMemberPayload([
      ...selectedGroupMemberPayload,
      adminPayload,
    ]);
  }

  const chatInitiatedTo = updatedPrivateMembers.find(
    (user) => user.email !== emailAddress
  );

  if (!chatInitiatedTo) {
    console.error("❌ No valid 'chatInitiatedTo' found");
    return;
  }

  const chatInitiatedToPayload = {
    email: chatInitiatedTo.email,
    userName: (chatInitiatedTo as any).userName ?? "Unknown", // fallback if needed
  };

  const privateChatPayload: PrivateChat = {
    type: "private",
    chatInitiatedFrom: adminPayload,
    chatInitiatedTo: chatInitiatedToPayload,
    chatName: groupNameInput.current.value,
    chatId: chatIdGenerator({ emailAddress: emailAddress }),
  };

  if (
    privateChatPayload.chatName !== "" &&
    privateChatPayload.chatInitiatedFrom.email !== "" &&
    privateChatPayload?.chatInitiatedTo?.email !== ""
  ) {
    axios
      .post(Endpoints.userInitiatePrivateChat, privateChatPayload, {
        headers: Endpoints.getHeaders(),
      })
      .then((response) => {
        const { success, message } = response.data;
        if (success) {
          setChatList((prevChatList) => [...prevChatList, privateChatPayload]);
          setShowCreateGroupIntf(false);
          setSelectedGroupMemberPayload([]);
          sockets.emit("chatInitated", emailAddress);
        } else {
          setWarningMsg(message);
        }
      })
      .catch((err) => setWarningMsg(err.message));
    setWarningMsg("");
    setGroupMembersInputValue("");
  } else {
    setWarningMsg("Fields cannot be blank");

    setTimeout(() => {
      setWarningMsg("");
    }, 3000);
  }
};

// handleCreateContactFunction
