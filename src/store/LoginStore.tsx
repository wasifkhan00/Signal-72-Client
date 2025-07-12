"use client";

import { create } from "zustand";

interface LoginStore {
  incorrectEmailOrPassword: boolean;
  usersName: string;
  showWaitForApiResponse: boolean;
  email: string;
  password: string;

  setIncorrectEmailOrPassword: (value: boolean) => void;
  setUsersName: (name: string) => void;
  setShowWaitForApiResponse: (show: boolean) => void;
  setEmail: (val: string) => void;
  setPassword: (val: string) => void;
}

export const useLoginStore = create<LoginStore>((set) => ({
  incorrectEmailOrPassword: false,
  usersName: "",
  showWaitForApiResponse: false,
  email: "",
  password: "",

  setIncorrectEmailOrPassword: (value) =>
    set({ incorrectEmailOrPassword: value }),
  setUsersName: (name) => set({ usersName: name }),
  setShowWaitForApiResponse: (show) => set({ showWaitForApiResponse: show }),
  setEmail: (val) => set({ email: val }),
  setPassword: (val) => set({ password: val }),
}));
