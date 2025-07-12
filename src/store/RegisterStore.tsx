"use client";

import { create } from "zustand";

interface RegisterStore {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;

  dbUserData: { name: string; email: string } | null;

  fullNameValidator: boolean;
  accountValidator: boolean;
  passwordValidator: boolean;
  confirmPasswordValidator: boolean;
  alreadyExistsEmail: boolean;
  showWaitForApiResponse: boolean;
  successMessage: boolean;
  hasJustRegistered: boolean; // inside store

  showOtpScreen: boolean;
  errorNetworkWarning: boolean;

  setField: (field: string, value: any) => void;
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
  hasJustRegistered: false, // inside store

  showOtpScreen: false,
  errorNetworkWarning: false,

  setField: (field, value) => set((state) => ({ ...state, [field]: value })),

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
