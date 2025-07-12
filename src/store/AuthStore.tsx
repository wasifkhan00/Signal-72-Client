"use client";
// stores/userStore.ts

import { create } from "zustand";

interface AuthStoreType {
  emailAddress: string;
  name: string;
  token: string;
  showChat: boolean;

  setEmailAddress: (emailAddress: string) => void;
  setName: (name: string) => void;
  setToken: (token: string) => void;
  setShowChat: (show: boolean) => void;
  resetUser: () => void;
}

export const AuthStore = create<AuthStoreType>((set) => ({
  emailAddress: "",
  name: "",
  token: "",
  showChat: false,

  setEmailAddress: (emailAddress) => set({ emailAddress }),
  setName: (name) => set({ name }),
  setToken: (token) => set({ token }),
  setShowChat: (show) => set({ showChat: show }),

  resetUser: () =>
    set({
      emailAddress: "",
      name: "",
      token: "",
      showChat: false,
    }),
}));
