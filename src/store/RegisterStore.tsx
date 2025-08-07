"use client";

import { create } from "zustand";

interface DBUserData {
  name: string;
  email: string;
}

interface RegisterStore {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;

  dbUserData: DBUserData | null;

  fullNameValidator: boolean;
  accountValidator: boolean;
  passwordValidator: boolean;
  confirmPasswordValidator: boolean;
  alreadyExistsEmail: boolean;
  showWaitForApiResponse: boolean;
  successMessage: boolean;
  hasJustRegistered: boolean;
  showOtpScreen: boolean;
  errorNetworkWarning: boolean;

  // Explicit setters
  setFullName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  setDBUserData: (data: DBUserData | null) => void;

  setFullNameValidator: (val: boolean) => void;
  setAccountValidator: (val: boolean) => void;
  setPasswordValidator: (val: boolean) => void;
  setConfirmPasswordValidator: (val: boolean) => void;
  setAlreadyExistsEmail: (val: boolean) => void;
  setShowWaitForApiResponse: (val: boolean) => void;
  setSuccessMessage: (val: boolean) => void;
  setHasJustRegistered: (val: boolean) => void;
  setShowOtpScreen: (val: boolean) => void;
  setErrorNetworkWarning: (val: boolean) => void;

  resetAll: () => void;
}

export const useRegisterStore = create<RegisterStore>((set) => ({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  dbUserData: null,

  fullNameValidator: false,
  accountValidator: false,
  passwordValidator: false,
  confirmPasswordValidator: false,
  alreadyExistsEmail: false,
  showWaitForApiResponse: false,
  successMessage: false,
  hasJustRegistered: false,
  showOtpScreen: false,
  errorNetworkWarning: false,

  // Setters
  setFullName: (val) => set({ fullName: val }),
  setEmail: (val) => set({ email: val }),
  setPassword: (val) => set({ password: val }),
  setConfirmPassword: (val) => set({ confirmPassword: val }),
  setDBUserData: (val) => set({ dbUserData: val }),

  setFullNameValidator: (val) => set({ fullNameValidator: val }),
  setAccountValidator: (val) => set({ accountValidator: val }),
  setPasswordValidator: (val) => set({ passwordValidator: val }),
  setConfirmPasswordValidator: (val) => set({ confirmPasswordValidator: val }),
  setAlreadyExistsEmail: (val) => set({ alreadyExistsEmail: val }),
  setShowWaitForApiResponse: (val) => set({ showWaitForApiResponse: val }),
  setSuccessMessage: (val) => set({ successMessage: val }),
  setHasJustRegistered: (val) => set({ hasJustRegistered: val }),
  setShowOtpScreen: (val) => set({ showOtpScreen: val }),
  setErrorNetworkWarning: (val) => set({ errorNetworkWarning: val }),

  resetAll: () =>
    set({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      dbUserData: null,
      fullNameValidator: false,
      accountValidator: false,
      passwordValidator: false,
      confirmPasswordValidator: false,
      alreadyExistsEmail: false,
      showWaitForApiResponse: false,
      successMessage: false,
      hasJustRegistered: false,
      showOtpScreen: false,
      errorNetworkWarning: false,
    }),
}));
