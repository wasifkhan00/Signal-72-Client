import React, { useRef, useEffect, useState, useMemo } from "react";
import "../styles/components/CreateGroupInterface.css";
// import User from "../components/User";
import {
  findUserByEmail,
  checkIfUserAlreadyCreatedGroup,
  // handleCreateGroup,
  // usersComponentOnclick,
  handleCreateContact,
} from "../lib/CreateGroupInterfaceApi";
import useCreateGroupStore from "@store/CreateGroupInterfaceStore";
import { AuthStore } from "@store/AuthStore";
import useChatStore from "@store/ChatStore";
import debounce from "debounce";
// import UserTag from "@utils/SmallTag";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  // DialogTrigger,
} from "../tailwindComponents/components/ui/dialog";
import { Button } from "../tailwindComponents/components/ui/button";
import { Loader2, MessageSquare, Search } from "lucide-react";
import { DialogHeader } from "../tailwindComponents/components/ui/dialog";
// import { AlertDialogContent } from "../tailwindComponents/components/ui/alert-dialog";
import { Label } from "../tailwindComponents/components/ui/label";
import { Input } from "../tailwindComponents/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../tailwindComponents/components/ui/avatar";
import { toast } from "sonner";

const Create_Group_Interface = () => {
  // const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchUser, setSearchUser] = useState("");

  const { emailAddress } = AuthStore();
  const {
    // setShowCreateGroupIntf,
    // showCreateGroupIntf,
    // isModePrivateChat,
    selectedGroupMemberPayload,
    setSelectedGroupMemberPayload,
    openCreateContactModal,
    chatList,
    isSearching,
    setIsSearching,
    setOpenCreateContactModal,
  } = useChatStore();

  const {
    groupMembersResponse,
    setGroupMembersResponse,

    groupMembersInputValue,
    setGroupMembersInputValue,
    // showResponsesFromApi,
    setWarningMsg,
    setShowResponsesFromApi,
    // warningMsg,
  } = useCreateGroupStore();
  const groupMembersInputValues = useRef<HTMLInputElement>(null);
  const groupNameInput = useRef<HTMLInputElement | null>(null);

  // const warning_Color = {
  //   color: "white",
  //   fontSize: "11px",
  // };

  useEffect(() => {
    // User Exists and Havent Created Any Group or Added by others
    checkIfUserAlreadyCreatedGroup();
  }, []);

  // **************************************************************************new
  const findUserByEmailDebounced = useMemo(
    () => debounce(findUserByEmail, 1500),
    []
  );

  useEffect(() => {
    const allowedChars = /^[a-zA-Z0-9._@-]+$/;

    if (isDeleting) {
      return;
    }

    if (
      groupMembersInputValue !== "" &&
      allowedChars.test(groupMembersInputValue)
    ) {
      findUserByEmailDebounced();
    } else {
      // toast.error("Please Enter 2 Words");
    }
  }, [groupMembersInputValue, findUserByEmailDebounced]);

  // **************************************************************************new
  function removeTheSpan(e: React.MouseEvent<HTMLInputElement>) {
    const emailToRemove = e.currentTarget.getAttribute("data-user-email");
    if (!emailToRemove) return;

    console.log("Removing email:", emailToRemove);

    const updatedArray = selectedGroupMemberPayload.filter(
      (member) => member.email !== emailToRemove
    );

    setSelectedGroupMemberPayload(updatedArray);
    setWarningMsg("");

    setTimeout(() => {
      console.log(selectedGroupMemberPayload);
    }, 6000);
  }

  const handleClickOnFirstInput = (e: React.MouseEvent<HTMLInputElement>) => {
    setShowResponsesFromApi(false);
  };

  // const avatar =
  //   "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face";

  const handleCancelButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    // setShowCreateGroupIntf(!showCreateGroupIntf);
    setIsSearching(false);
    setOpenCreateContactModal(false);
    setWarningMsg("");
    groupNameInput.current!.value = "";
    groupMembersInputValues.current!.value = "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchUser(e.target.value);

    if (value.length < 2) {
      setGroupMembersResponse([]);
      setSelectedGroupMemberPayload([]);
      return;
    }
    console.log(e.target.value);

    if (value.length >= 2) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    if (!value) {
      setWarningMsg("Email field cannot be empty.");
    } else if (value === emailAddress) {
      setWarningMsg("You cannot add yourself in the group.");
    } else {
      setWarningMsg("");
      setGroupMembersInputValue(value);
    }
  };

  useEffect(() => {
    if (groupMembersResponse.length > 0) {
      setIsSearching(false);
    }
  }, [groupMembersResponse]);

  const handleUserSelect = (e) => {
    setGroupMembersResponse([]);
    const chatStore = useChatStore.getState();
    const useCreateGroupStores = useCreateGroupStore.getState();
    const target = e.currentTarget as HTMLElement;
    useCreateGroupStores.setShowResponsesFromApi(false);
    const userId = target.getAttribute("data-user-id");
    const userName = target.getAttribute("data-user-name");
    const rsaPublicKey = target.getAttribute("data-user-rsakey");

    if (groupNameInput.current) {
      groupNameInput.current.value = userName!;
    }

    if (userId === emailAddress.toLowerCase()) {
      toast.error("You can't send messages to yourself.");
      useCreateGroupStores.setWarningMsg(
        "You cannot add yourself in the group"
      );
      return "failed";
    }

    const alreadyExists =
      selectedGroupMemberPayload &&
      selectedGroupMemberPayload.length > 0 &&
      selectedGroupMemberPayload.some((group: any) => group?.email == userId);

    const PayloadPrivateChatMembers: any = [
      {
        email: userId,
        userName: userName,
        rsaPublicKey: rsaPublicKey,
      },
    ];

    if (alreadyExists) {
      toast.error("User Already Selected");
      useCreateGroupStores.setWarningMsg("User Already Selected");
      setTimeout(() => {
        useCreateGroupStores.setWarningMsg("");
      }, 3000);
      return;
    }

    if (selectedGroupMemberPayload.length >= 1) {
      toast.error("You can only select 1 person for Private Chat");
      useCreateGroupStores.setWarningMsg(
        "You can only select 1 person for Private Chat"
      );
      setTimeout(() => {
        useCreateGroupStores.setWarningMsg("");
      }, 3000);
    }
    const isChatForThisUserALreadyInitiated = chatList.some(
      (chat) =>
        chat.chatInitiatedTo?.email === userId ||
        chat.chatInitiatedFrom?.email === userId
    );

    if (isChatForThisUserALreadyInitiated) {
      toast.error("You have already Initiated Chat with this User");
      useCreateGroupStores.setWarningMsg(
        "You have already Initiated Chat with this User"
      );
      setTimeout(() => {
        useCreateGroupStores.setWarningMsg("");
      }, 3000);
      return;
    }

    setSelectedGroupMemberPayload([
      ...chatStore.selectedGroupMemberPayload,
      ...PayloadPrivateChatMembers,
    ]);

    if (groupMembersInputValues.current) {
      groupMembersInputValues.current.value = userId;

      setGroupMembersResponse([]);
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      setIsDeleting(true);
    } else {
      setIsDeleting(false);
    }
  };
  return (
    <>
      <Dialog
        open={openCreateContactModal}
        onOpenChange={setOpenCreateContactModal}
      >
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <MessageSquare className="h-5 w-5" />
              Add New Contact
            </DialogTitle>
            <DialogDescription>
              Start a private conversation with a new contact
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                onClick={handleClickOnFirstInput}
                ref={groupNameInput}
                type="text"
                maxLength={34}
                id="contactName"
                autoComplete="off"
                placeholder="Enter contact name..."
                autoFocus
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="emailAddress">Email Address</Label>
              <div className="relative">
                <Input
                  id="emailAddress"
                  ref={groupMembersInputValues}
                  required
                  maxLength={34}
                  autoComplete="off"
                  onChange={handleEmailChange}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="Enter email address..."
                  type="email"
                  className={
                    groupMembersResponse.length > 0 ? "rounded-b-none" : ""
                  }
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* *****************************Final Search************************************ */}

              {groupMembersResponse.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-popover border border-border border-t-0 rounded-b-md shadow-lg ">
                  <ScrollArea className="max-h-48">
                    <div className="p-1 bg-[#F8F8FF]">
                      {groupMembersResponse.map((users) => {
                        return (
                          <div
                            onClick={handleUserSelect}
                            key={users.userId}
                            data-user-rsakey={users.rsaPublicKey}
                            data-user-id={users.userEmail}
                            data-chat-id={users.chatId}
                            data-user-name={users.userName}
                            className=" border border-gray-400  flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={users.avatar}
                                alt={users.userName}
                              />
                              <AvatarFallback className="bg-[rgb(113,132,135)] text-white rounded-full">
                                {users.userName
                                  .split(" ")
                                  .map((n: any) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {users.userEmail === emailAddress
                                  ? "You"
                                  : users.userName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {users.userEmail}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Search hint */}
              {searchUser &&
                searchUser.length >= 1 &&
                searchUser.length < 2 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    Type 2+ characters to search for existing users
                  </p>
                )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                // onClick={handleClose}
                onClick={handleCancelButton}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#9370DB] !text-white"
                onClick={() => {
                  handleCreateContact({ groupNameInput });
                }}
                disabled={selectedGroupMemberPayload.length > 0 ? false : true}
              >
                Add Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Create_Group_Interface;
