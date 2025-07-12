import { create } from "zustand";

interface ChatModulesStore {
  warningMsg: string;
  setWarningMsg: (val: string) => void;

  showContainerOfResponses: boolean;
  setShowContainerOfResponses: (val: boolean) => void;

  groupMembersInputValue: string;
  setGroupMembersInputValue: (val: string) => void;

  registeredUsers: any[]; // You can replace 'any' with your actual user type
  setRegisteredUsers: (val: any[]) => void;

  selectedUserForPrivateChat: any[];
  setSelectedUserForPrivateChat: (val: any[]) => void;

  showDropDown: boolean;
  setShowDropDown: (val: boolean) => void;

  imageUrl: string;
  setImageUrl: (val: string) => void;

  imageUrlView: string;
  setImageUrlView: (val: string) => void;

  viewImage: boolean;
  setViewImage: (val: boolean) => void;

  showWait: boolean;
  setShowWait: (val: boolean) => void;

  viewImageContainer: boolean;
  setviewImageContainer: (val: boolean) => void;

  today: string;
  setToday: (val: string) => void;

  yesterday: string;
  setYesterday: (val: string) => void;

  showUserLeftGroup: Record<string, any>;
  setShowUserLeftGroup: (val: Record<string, any>) => void;

  groupMems: any;
  setGroupMems: (val: any) => void;

  addedInTheGroupBy: string;
  setAddedInTheGroupBy: (val: string) => void;

  editGroupName: boolean;
  setEditGroupName: (val: boolean) => void;

  you: boolean;
  setYou: (val: boolean) => void;
}

const useChatModulesStore = create<ChatModulesStore>((set) => ({
  warningMsg: "",
  setWarningMsg: (val) => set({ warningMsg: val }),

  showContainerOfResponses: false,
  setShowContainerOfResponses: (val) => set({ showContainerOfResponses: val }),

  groupMembersInputValue: "",
  setGroupMembersInputValue: (val) => set({ groupMembersInputValue: val }),

  registeredUsers: [],
  setRegisteredUsers: (val) => set({ registeredUsers: val }),

  selectedUserForPrivateChat: [],
  setSelectedUserForPrivateChat: (val) =>
    set({ selectedUserForPrivateChat: val }),

  showDropDown: false,
  setShowDropDown: (val) => set({ showDropDown: val }),

  imageUrl: "",
  setImageUrl: (val) => set({ imageUrl: val }),

  imageUrlView: "",
  setImageUrlView: (val) => set({ imageUrlView: val }),

  viewImage: false,
  setViewImage: (val) => set({ viewImage: val }),

  showWait: false,
  setShowWait: (val) => set({ showWait: val }),

  viewImageContainer: false,
  setviewImageContainer: (val) => set({ viewImageContainer: val }),

  today: "",
  setToday: (val) => set({ today: val }),

  yesterday: "",
  setYesterday: (val) => set({ yesterday: val }),

  showUserLeftGroup: {},
  setShowUserLeftGroup: (val) => set({ showUserLeftGroup: val }),

  groupMems: "",
  setGroupMems: (val) => set({ groupMems: val }),

  addedInTheGroupBy: "",
  setAddedInTheGroupBy: (val) => set({ addedInTheGroupBy: val }),

  editGroupName: false,
  setEditGroupName: (val) => set({ editGroupName: val }),

  you: false,
  setYou: (val) => set({ you: val }),
}));

export default useChatModulesStore;
