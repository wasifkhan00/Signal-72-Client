import { create } from "zustand";

interface AppStore {
  dark: boolean;
  setDark: (val: boolean) => void;

  showRightSideMobile: boolean;
  setShowRightSideMobile: (val: boolean) => void;

  showDarkAndLightModeDropDown: boolean;
  setShowDarkAndLightModeDropDown: (val: boolean) => void;

  isChecked: boolean;
  setIsChecked: (val: boolean) => void;

  userIsExitingTheGroup: boolean;
  setUserIsExitingTheGroup: (val: boolean) => void;

  userIsChangingGroupName: boolean;
  setUserIsChangingGroupName: (val: boolean) => void;

  addMoreFriendsInGroup: boolean;
  setAddMoreFriendsInGroup: (val: boolean) => void;

  loggOut: boolean;
  setLoggOut: (val: boolean) => void;
}

const useAppStore = create<AppStore>((set) => ({
  dark: false,
  setDark: (val) => set({ dark: val }),

  showRightSideMobile: false,
  setShowRightSideMobile: (val) => set({ showRightSideMobile: val }),

  showDarkAndLightModeDropDown: false,
  setShowDarkAndLightModeDropDown: (val) =>
    set({ showDarkAndLightModeDropDown: val }),

  isChecked: false,
  setIsChecked: (val) => set({ isChecked: val }),

  userIsExitingTheGroup: false,
  setUserIsExitingTheGroup: (val) => set({ userIsExitingTheGroup: val }),

  userIsChangingGroupName: false,
  setUserIsChangingGroupName: (val) => set({ userIsChangingGroupName: val }),

  addMoreFriendsInGroup: false,
  setAddMoreFriendsInGroup: (val) => set({ addMoreFriendsInGroup: val }),

  loggOut: false,
  setLoggOut: (val) => set({ loggOut: val }),
}));

export default useAppStore;
