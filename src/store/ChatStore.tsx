import { generateChatId } from "@utils/ChatIdGenerator";
import { create } from "zustand";

interface GroupMember {
  email: string;
  isAdmin: boolean;
  addedBy: string;
}
export interface GroupChat {
  type: "group";
  createdBy: string;
  chatId: string;
  groupNames: string;
  members: GroupMember[];
}

export interface PrivateChat {
  type: "private";
  chatInitiatedFrom: {
    email: string;
    userName: string;
  };
  chatInitiatedTo: {
    email: string;
    userName: string;
  };
  chatName: string;
  chatId: string;
}

export type Chat = GroupChat | PrivateChat;

interface ChatStore {
  typing: boolean;
  setTyping: (val: boolean) => void;

  isSeen: boolean;
  setIsSeen: (val: boolean) => void;

  heIsTyping: string;
  setHeIsTyping: (val: string) => void;

  messages: any[]; // You can later define a proper Message type
  setMessages: (val: any[] | ((prev: any[]) => any[])) => void;

  unreadMessages: boolean;
  setUnreadMessages: (val: boolean) => void;

  chatList: Chat[];
  setChatList: (val: Chat[] | ((prev: Chat[]) => Chat[])) => void;

  sendImage: boolean;
  setSendImage: (val: boolean) => void;

  uploadedImageDimensions: { width: number; height: number } | null;
  setUploadedImageDimensions: (
    val: { width: number; height: number } | null
  ) => void;

  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;

  groupName: string;
  setGroupName: (val: string) => void;

  groupMembers: GroupMember[];
  setGroupMembers: (val: any[]) => void;

  chatId: string;
  setChatId: (val: string) => void;

  userIsAdmin: boolean;
  setUserIsAdmin: (val: boolean) => void;

  // addingGroupMembers: any[];
  // setAddingGroupMembers: (val: any[]) => void;

  showCreateGroupIntf: boolean;
  setShowCreateGroupIntf: (val: boolean) => void;

  lastMessageInfo: Record<string, any>;
  setLastMessageInfo: (val: Record<string, any>) => void;

  DiscardMyMedia: boolean;
  setDiscardMyMedia: (val: boolean) => void;

  showLoadingInterface: boolean;
  setShowLoadingInterface: (val: boolean) => void;

  chatIdGenerator: typeof generateChatId;

  selectedChat: GroupChat | null;
  setSelectedChat: (val: GroupChat | null) => void;

  selectedGroupMemberPayload: GroupMember[];
  setSelectedGroupMemberPayload: (val: GroupMember[]) => void;

  isModePrivateChat: boolean;
  setIsModePrivateChat: (value: boolean) => void;
}

const useChatStore = create<ChatStore>((set) => ({
  selectedGroupMemberPayload: [],
  setSelectedGroupMemberPayload: (val) =>
    set({ selectedGroupMemberPayload: val }),

  typing: false,
  setTyping: (val) => set({ typing: val }),

  isSeen: false,
  setIsSeen: (val) => set({ typing: val }),

  heIsTyping: "",
  setHeIsTyping: (val) => set({ heIsTyping: val }),

  messages: [],
  setMessages: (val) =>
    set((state) => ({
      messages: typeof val === "function" ? val(state.messages) : val,
    })),

  unreadMessages: false,
  setUnreadMessages: (val) => set({ unreadMessages: val }),

  chatList: [],
  setChatList: (val) =>
    set((state) => ({
      chatList: typeof val === "function" ? val(state.chatList) : val,
    })),

  sendImage: false,
  setSendImage: (val) => set({ sendImage: val }),

  uploadedImageDimensions: null,
  setUploadedImageDimensions: (val) => set({ uploadedImageDimensions: val }),

  isAdmin: false,
  setIsAdmin: (val) => set({ isAdmin: val }),

  groupName: "",
  setGroupName: (val) => set({ groupName: val }),

  groupMembers: [],
  setGroupMembers: (val) => set({ groupMembers: val }),

  chatId: "",
  setChatId: (val) => set({ chatId: val }),

  userIsAdmin: false,
  setUserIsAdmin: (val) => set({ userIsAdmin: val }),

  // addingGroupMembers: [],
  // setAddingGroupMembers: (val) => set({ addingGroupMembers: val }),

  showCreateGroupIntf: false,
  setShowCreateGroupIntf: (val) => set({ showCreateGroupIntf: val }),

  lastMessageInfo: {},
  setLastMessageInfo: (val) => set({ lastMessageInfo: val }),

  DiscardMyMedia: false,
  setDiscardMyMedia: (val) => set({ DiscardMyMedia: val }),

  showLoadingInterface: false,
  setShowLoadingInterface: (val) => set({ showLoadingInterface: val }),

  chatIdGenerator: generateChatId,

  selectedChat: null,
  setSelectedChat: (val) => set({ selectedChat: val }),

  isModePrivateChat: false,
  setIsModePrivateChat: (value: boolean) => set({ isModePrivateChat: value }),
}));

export default useChatStore;
