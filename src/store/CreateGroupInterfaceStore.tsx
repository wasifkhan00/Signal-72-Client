import { create } from "zustand";

interface SelectedUserGroupInfo {
  email: string;
  chatId?: string;
  groupName?: string;
  isAdmin?: boolean;
}

interface CreateGroupStore {
  everyUserGroupInfoEmail: any;
  setEveryUserGroupInfoEmail: (emails: string[]) => void;

  groupMembersInputValue: string;
  setGroupMembersInputValue: (val: string) => void;

  warningMsg: string;
  setWarningMsg: (val: string) => void;

  showResponsesFromApi: boolean;
  setShowResponsesFromApi: (val: boolean) => void;

  selectedUserGroupInformation: SelectedUserGroupInfo[];
  setSelectedUserGroupInformation: (
    updater:
      | SelectedUserGroupInfo[]
      | ((prev: SelectedUserGroupInfo[]) => SelectedUserGroupInfo[])
  ) => void;

  // ✅ New addition
  groupMembersResponse: any[];
  setGroupMembersResponse: (val: any[]) => void;
}

const useCreateGroupStore = create<CreateGroupStore>((set, get) => ({
  everyUserGroupInfoEmail: [],
  setEveryUserGroupInfoEmail: (emails) =>
    set({ everyUserGroupInfoEmail: emails }),

  groupMembersInputValue: "",
  setGroupMembersInputValue: (val) => set({ groupMembersInputValue: val }),

  warningMsg: "",
  setWarningMsg: (val) => set({ warningMsg: val }),

  showResponsesFromApi: false,
  setShowResponsesFromApi: (val) => set({ showResponsesFromApi: val }),

  selectedUserGroupInformation: [],
  setSelectedUserGroupInformation: (updater) => {
    if (typeof updater === "function") {
      set({
        selectedUserGroupInformation: updater(
          get().selectedUserGroupInformation
        ),
      });
    } else {
      set({ selectedUserGroupInformation: updater });
    }
  },

  // ✅ New state and setter
  groupMembersResponse: [],
  setGroupMembersResponse: (val) => set({ groupMembersResponse: val }),
}));

export default useCreateGroupStore;
