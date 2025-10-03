import useCreateGroupStore from "@store/CreateGroupInterfaceStore";
import { AuthStore } from "@store/AuthStore";
import Endpoints from "../endpoint/endpoints";
import axios from "axios";
import sockets from "../websockets/websockets";
import useChatStore, { GroupChat, PrivateChat } from "@store/ChatStore";
import { table } from "console";
import { AESChatKey } from "../encryption/GenerateAES";
import useChatModulesStore from "@store/ChatModulesStore";
import { saveDraftChat } from "../helpers/DraftChats";
import { toast } from "sonner";

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
      return;
    }
  } catch (error) {
    console.log(error);
  }
};

export const findUserByEmail = async () => {
  const store = useCreateGroupStore.getState();
  const chatStore = useChatStore.getState();
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
          rsaPublicKey: user.rsaPublicKey,
        }));

      store.setShowResponsesFromApi(true);
      store.setWarningMsg("");

      store.setGroupMembersResponse(filteredUsers);
      //   return filteredUsers;
    } else {
      toast.error("User Not Found");
      store.setGroupMembersResponse([]);
      chatStore.setIsSearching(false);
      store.setWarningMsg("User not found");
      store.setShowResponsesFromApi(false);
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
  const rsaPublicKey = target.getAttribute("data-user-rsakey");
  // console.log(rsaPublicKey);

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
      rsaPublicKey: rsaPublicKey,
    },
  ];

  const PayloadPrivateChatMembers: any = [
    {
      email: userId,
      userName: userName,
      rsaPublicKey: rsaPublicKey,
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

    // console.log(chatStore.chatList); // if(PayloadPrivateChatMembers.email === )

    // ****************************************************************************************************************

    const isChatForThisUserALreadyInitiated = chatStore.chatList.some(
      (chat) =>
        chat.chatInitiatedTo?.email === userId ||
        chat.chatInitiatedFrom?.email === userId
    );

    if (isChatForThisUserALreadyInitiated) {
      useCreateGroupStores.setWarningMsg(
        "You have already Initiated Chat with this User"
      );
      setTimeout(() => {
        useCreateGroupStores.setWarningMsg("");
      }, 3000);
      return;
    }
    // ****************************************************************************************************************
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
export const handleCreateGroup = async ({ groupNameInput }: any) => {
  const { emailAddress, name } = AuthStore.getState();
  const {
    setChatList,
    selectedGroupMemberPayload,
    setShowCreateGroupIntf,
    setSelectedGroupMemberPayload,
    chatIdGenerator,
    setOpenCreateGroupModal,
  } = useChatStore.getState();

  const { setAddedInTheGroupBy } = useChatModulesStore.getState();

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
  // return null;
  const groupChatId = chatIdGenerator({ emailAddress: emailAddress });

  const encryptedAESKey = await AESChatKey.generateKeyForGroupChat(
    groupChatId,
    updatedMembers
  );

  const groupPayload: GroupChat = {
    type: "group",
    createdBy: emailAddress,
    chatId: groupChatId,
    groupNames: groupNameInput.current.value,
    members: updatedMembers,
    encryptedAESKeys: encryptedAESKey?.encryptedAESKeyObject,
  };

  if (groupPayload.groupNames !== "" && groupPayload.members.length > 0) {
    axios
      .post(Endpoints.userCreatedNewGroup, groupPayload, {
        headers: Endpoints.getHeaders(),
      })
      .then((response) => {
        const { success, message } = response.data;
        if (success) {
          toast.success(
            `Group "${groupPayload.groupNames}" created with ${updatedMembers.length} members! 🎉`
          );

          setOpenCreateGroupModal(false);

          console.log(groupPayload);
          setChatList((prevChatList) => [...prevChatList, groupPayload]);
          // setAddedInTheGroupBy(groupPayload.createdBy); //SHOULD BE BROADCASTED AND SENT VIA EMIT
          setShowCreateGroupIntf(false);
          setSelectedGroupMemberPayload([]);
          if (!sockets.connected) sockets.connect();
          sockets.emit("chatInitated", groupPayload.chatId);
          sockets.emit("newChat", groupPayload);
          // sockets.emit('') //emit event directly to the other user and let him know hes initiated chat to.... but that would be empty planning on to let him know when the user initiates chat
          // when the user sends message and hes yet not added emit('userIsInitiatedWithChat) for instance i initiate chat to person a and i send him message he should instantly recieve it without being redirected to the chat
        } else {
          setWarningMsg(message);
        }
      })
      .catch((err) => setWarningMsg(err.message));
    setWarningMsg("");
    setGroupMembersInputValue("");
  } else {
    setWarningMsg("Fields cannot be blank");
    toast.error("Fields cannot be blank");
    setTimeout(() => {
      setWarningMsg("");
    }, 3000);
  }
};
// handleCreateGroupFunction

// handleCreateContactFunction

export const handleCreateContact = async ({ groupNameInput }: any) => {
  const { emailAddress, name } = AuthStore.getState();
  const {
    setChatList,
    setShowCreateGroupIntf,
    setSelectedGroupMemberPayload,
    selectedGroupMemberPayload,
    chatIdGenerator,
    isModePrivateChat,
    setOpenCreateContactModal,
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

  const userRsaPublicKey = selectedGroupMemberPayload[0].rsaPublicKey;

  const privateChatId = chatIdGenerator({ emailAddress: emailAddress });
  // console.log(selectedGroupMemberPayload);
  const encryptedAESKey = await AESChatKey.generateKeyForChat(
    privateChatId,
    userRsaPublicKey
  );

  const privateChatPayload: PrivateChat = {
    type: "private",
    chatInitiatedFrom: adminPayload,
    chatInitiatedTo: chatInitiatedToPayload,
    chatName: groupNameInput.current.value,
    chatId: privateChatId,
    encryptedAESKeys: encryptedAESKey.encryptedAESKeyObject,
  };

  if (
    privateChatPayload.chatName !== "" &&
    privateChatPayload.chatInitiatedFrom.email !== "" &&
    privateChatPayload?.chatInitiatedTo?.email !== ""
  ) {
    const saveChatToDraft = saveDraftChat(privateChatPayload);

    if (saveChatToDraft === "chat_already_exists") {
      setWarningMsg("Chat Already Initiated");
      toast.error("Chat Already Initiated");
      return;
    } else {
      setOpenCreateContactModal(false);
      setChatList((prevChatList) => [...prevChatList, privateChatPayload]);
      setShowCreateGroupIntf(false);
    }
  } else {
    toast.error("Fields cannot be blank");
    setWarningMsg("Fields cannot be blank");

    setTimeout(() => {
      setWarningMsg("");
    }, 3000);
  }
};

// handleCreateContactFunction
