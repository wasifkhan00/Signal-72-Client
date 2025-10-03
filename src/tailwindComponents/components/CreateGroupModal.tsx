"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Users, X, Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import useChatStore from "@store/ChatStore";
import { AuthStore } from "@store/AuthStore";
import useCreateGroupStore from "@store/CreateGroupInterfaceStore";
import {
  checkIfUserAlreadyCreatedGroup,
  findUserByEmail,
  handleCreateGroup,
} from "../../lib/CreateGroupInterfaceApi";
import debounce from "debounce";
import { AESChatKey } from "../../encryption/GenerateAES";

// Mock user database - searchable by typing 2+ characters
const mockUsers = [
  {
    id: "1",
    name: "Wasif Ahmed",
    email: "wasif.ahmed@company.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Bob Smith",
    email: "bob.smith@company.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "5",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "6",
    name: "Emma Davis",
    email: "emma.davis@company.com",
    avatar:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "7",
    name: "John Martinez",
    email: "john.martinez@company.com",
    avatar:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "8",
    name: "Lisa Rodriguez",
    email: "lisa.rodriguez@company.com",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "9",
    name: "David Kumar",
    email: "david.kumar@company.com",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "10",
    name: "Amy Thompson",
    email: "amy.thompson@company.com",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "11",
    name: "Ryan Johnson",
    email: "ryan.johnson@company.com",
    avatar:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "12",
    name: "Maria Garcia",
    email: "maria.garcia@company.com",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "13",
    name: "Kevin Park",
    email: "kevin.park@company.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "14",
    name: "Nina Patel",
    email: "nina.patel@company.com",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "15",
    name: "Omar Hassan",
    email: "omar.hassan@company.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
];

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface CreateGroupModalProps {
  children?: React.ReactNode;
}

export function CreateGroupModal({ children }: CreateGroupModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // ***************Imported From creategrpinterface ***************************************************************************************************************************************************************************************************************************************
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchUser, setSearchUser] = useState("");

  const { emailAddress, rsaPublicKey } = AuthStore();

  const {
    setShowCreateGroupIntf,
    showCreateGroupIntf,
    isModePrivateChat,
    selectedGroupMemberPayload,
    setSelectedGroupMemberPayload,

    openCreateGroupModal,

    chatList,
    // isSearching,
    // setIsSearching,
    setOpenCreateGroupModal,
  } = useChatStore();

  const {
    groupMembersResponse,
    setGroupMembersResponse,

    groupMembersInputValue,
    setGroupMembersInputValue,
    showResponsesFromApi,
    setWarningMsg,
    setShowResponsesFromApi,
    warningMsg,
  } = useCreateGroupStore();
  const groupMembersInputValues = useRef<HTMLInputElement>(null);
  const groupNameInput = useRef<HTMLInputElement | null>(null);

  const warning_Color = {
    color: "white",
    fontSize: "11px",
  };

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

  // const handleClickSecondInputContainer = (
  //   e: React.MouseEvent<HTMLInputElement>
  // ) => {
  //   if (groupMembersResponse.length > 0) {
  //     // setShowResponsesFromApi(!showResponsesFromApi);
  //   } else {
  //     return null;
  //   }
  // };

  // const handleChangeSecondInput = () => {};
  const avatar =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face";

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

    // if (value.length < 2) {
    //   // setGroupMembersResponse([]);
    //   // setSelectedGroupMemberPayload([]);
    //   return;
    // }
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
    groupMembersInputValues!.current!.value = "";
    const chatStore = useChatStore.getState();
    const AuthStores = AuthStore.getState();
    const useCreateGroupStores = useCreateGroupStore.getState();
    const target = e.currentTarget as HTMLElement;
    useCreateGroupStores.setShowResponsesFromApi(false);
    const userId = target.getAttribute("data-user-id");
    const userName = target.getAttribute("data-user-name");
    const rsaPublicKey = target.getAttribute("data-user-rsakey");

    if (userId === emailAddress.toLowerCase()) {
      toast.error("You cannot add yourself in the group");
      useCreateGroupStores.setWarningMsg(
        "You cannot add yourself in the group"
      );
      return "failed";
    }

    const alreadyExists =
      selectedGroupMemberPayload &&
      selectedGroupMemberPayload.length > 0 &&
      selectedGroupMemberPayload.some((group: any) => group?.email == userId);

    const PayloadMembers: any = [
      {
        email: userId,
        isAdmin: false,
        addedBy: emailAddress,
        userName: userName,
        rsaPublicKey: rsaPublicKey,
      },
    ];

    if (alreadyExists) {
      toast.error("User already selected");
      useCreateGroupStores.setWarningMsg("User Already Selected");
      setTimeout(() => {
        useCreateGroupStores.setWarningMsg("");
      }, 3000);
      return;
    }

    toast.success(`Added ${userName} to the group`);

    setSelectedGroupMemberPayload([
      ...chatStore.selectedGroupMemberPayload,
      ...PayloadMembers,
    ]);
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      setIsDeleting(true);
    } else {
      setIsDeleting(false);
    }
  };
  // ******************************************************************************************************************************************************************************************************************************************************

  // Search users when typing
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);

      // Simulate API call delay
      const timeoutId = setTimeout(() => {
        const results = mockUsers.filter(
          (user) =>
            (user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
            !selectedParticipants.find((p) => p.id === user.id)
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, selectedParticipants]);

  const handleClose = () => {
    setSelectedGroupMemberPayload([]);
    setOpenCreateGroupModal(false);
  };

  const removeParticipant = (userEmail: string, userName: string) => {
    if (!userEmail) return;

    const updatedArray = selectedGroupMemberPayload.filter(
      (member) => member.email !== userEmail
    );

    setSelectedGroupMemberPayload(updatedArray);
    toast.success(`Removed ${userName} from the group's participants`);
    setWarningMsg("");
  };

  return (
    <Dialog open={openCreateGroupModal} onOpenChange={setOpenCreateGroupModal}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create New Group
          </DialogTitle>
          <DialogDescription>
            Create a group chat with multiple participants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4" onClick={() => setGroupMembersResponse([])}>
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              ref={groupNameInput}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              autoFocus
            />
          </div>

          {/* Selected Participants */}
          {selectedGroupMemberPayload.length > 0 && (
            <div className="space-y-2">
              <Label>
                Selected Participants ({selectedGroupMemberPayload.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedGroupMemberPayload.map((participant) => {
                  return (
                    <Badge
                      key={participant.email}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1 bg-gray-300 text-black"
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarImage
                          src={participant.avatar}
                          alt={participant.userName}
                        />
                        <AvatarFallback className="text-xs bg-[rgb(113,132,135)] text-white rounded-full">
                          {participant.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{participant.userName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() =>
                          removeParticipant(
                            participant.email,
                            participant.userName
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search for Participants */}
          <div className="space-y-2 relative">
            <Label htmlFor="searchParticipants">Add Participants</Label>
            <div className="relative">
              <Input
                id="emailAddress"
                ref={groupMembersInputValues}
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

            {/* Search Results Dropdown creategroup Imported  */}

            {/* Search Results Dropdown creategroup Imported  */}

            {/* Search Results Dropdown creategroup Default  */}
            {groupMembersResponse.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-popover border border-border border-t-0 rounded-b-md shadow-lg  bg-white">
                <ScrollArea className="max-h-48">
                  <div className="p-1">
                    {groupMembersResponse.map((user) => {
                      return (
                        <div
                          key={user.userId}
                          data-user-rsakey={user.rsaPublicKey}
                          data-user-id={user.userEmail}
                          data-chat-id={user.chatId}
                          data-user-name={user.userName}
                          onClick={handleUserSelect}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.avatar}
                              alt={user.userName}
                            />
                            <AvatarFallback>
                              {user.userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.userEmail === emailAddress
                                ? "You"
                                : user.userName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.userEmail}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
            {/* Search Results Dropdown creategroup Default  */}

            {/* Search hint */}
            {searchUser.length >= 1 && searchUser.length <= 2 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Search className="h-3 w-3" />
                Type 2+ characters to search for users
              </p>
            )}

            {/* {searchUser.length >= 2 && groupMembersResponse.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No users found matching "{searchUser}"
              </p>
            )} */}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#9370DB] text-white hover:bg-[#7a5bbf] transition-colors"
              onClick={() => {
                handleCreateGroup({ groupNameInput });
              }}
              disabled={
                !groupNameInput.current?.value ||
                selectedGroupMemberPayload.length === 0
              }
            >
              Create Group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
