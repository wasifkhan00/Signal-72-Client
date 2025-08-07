"use client";
import { create } from "zustand";

interface AuthStoreType {
  emailAddress: string;
  name: string;
  token: string;
  showChat: boolean;

  rsaPrivateKey: CryptoKey | null;
  rsaPublicKey: Base64URLString | null;

  setEmailAddress: (emailAddress: string) => void;
  setName: (name: string) => void;
  setToken: (token: string) => void;
  setShowChat: (show: boolean) => void;

  setRSAKeyPairs: (keys: {
    rsaPrivateKey: CryptoKey;
    rsaPublicKey: Base64URLString;
  }) => void;
  clearRSAKeyPairs: () => void;

  resetUser: () => void;
}

export const AuthStore = create<AuthStoreType>((set) => ({
  emailAddress: "",
  name: "",
  token: "",
  showChat: false,

  rsaPrivateKey: null,
  rsaPublicKey: null,

  setEmailAddress: (emailAddress) => set({ emailAddress }),
  setName: (name) => set({ name }),
  setToken: (token) => set({ token }),
  setShowChat: (show) => set({ showChat: show }),

  setRSAKeyPairs: ({ rsaPrivateKey, rsaPublicKey }) =>
    set({ rsaPrivateKey, rsaPublicKey }),

  clearRSAKeyPairs: () => set({ rsaPrivateKey: null, rsaPublicKey: null }),

  resetUser: () =>
    set({
      emailAddress: "",
      name: "",
      token: "",
      showChat: false,
      rsaPrivateKey: null,
      rsaPublicKey: null,
    }),
}));
