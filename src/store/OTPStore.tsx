// store/otpStore.ts
"use client";

import { create } from "zustand";

interface OtpStore {
  timeLeft: number;
  canResend: boolean;
  otpAttempts: number;
  OTPSent: boolean;
  otp: string;
  invalidOTP: boolean;
  invalidOTPMessage: string;
  OTPVerifiedSuccess: boolean;
  showWaitForApiResponse: boolean;
  // showChat: boolean;

  setField: (field: keyof OtpStore, value: any) => void;
  resetOtpState: () => void;
}

export const useOtpStore = create<OtpStore>((set) => ({
  timeLeft: 60,
  canResend: false,
  otpAttempts: 3,
  OTPSent: false,
  otp: "",
  invalidOTP: false,
  invalidOTPMessage: "Invalid OTP",
  OTPVerifiedSuccess: false,
  showWaitForApiResponse: false,
  // showChat: false,

  setField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  resetOtpState: () =>
    set({
      timeLeft: 60,
      canResend: false,
      otpAttempts: 3,
      OTPSent: false,
      otp: "",
      invalidOTPMessage: "Invalid OTP",
      OTPVerifiedSuccess: false,
      showWaitForApiResponse: false,
      // showChat: false,
    }),
}));
