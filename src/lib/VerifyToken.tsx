// utils/verifyToken.ts

import axios from "axios";
import Endpoints from "../endpoint/endpoints"; // adjust
import localforage from "localforage";

export const verifyToken = async ({
  savedToken,
  savedEmail,
  savedNames,
  setUsersName,
  setEmailAddress,
  setHasJustRegistered,
  setSuccessMessage,
  setName,
  setToken,
  setShowChat,
  router,
  sockets,
}: {
  savedToken: string;
  savedEmail: string;
  savedNames: string;
  setSuccessMessage: Function;
  setHasJustRegistered: Function;
  setUsersName: Function;
  setEmailAddress: Function;
  setName: Function;
  setToken: Function;
  setShowChat: Function;
  router: any;
  sockets: any;
}) => {
  try {
    const res = await axios.post(
      Endpoints.verifyToken,
      { emailAddress: savedEmail },
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      }
    );

    const { success } = res.data;
    const { emails, names, verifiedEmail } = res.data.user;

    if (!success) throw new Error("Invalid token or malformed response");

    if (!verifiedEmail) {
      localStorage.setItem("unverifiedEmail", emails);
      setEmailAddress(emails);

      setHasJustRegistered(true);
      setTimeout(() => {
        router.push("/register/otp");
      }, 2000);
      return;
    }

    if (emails === savedEmail && names === savedNames) {
      setSuccessMessage(true);
      setUsersName(names);
      setEmailAddress(emails);
      setName(names);
      setToken(savedToken);
      setShowChat(true);

      router.push("/chat");

      if (!sockets.connected) {
        sockets.connect();
      }
    } else {
      console.warn("LocalStorage mismatch detected 🚨");
    }
  } catch (err) {
    alert("Token Verification Failed: Try Logging in manually");

    localStorage.removeItem("token");
    localStorage.removeItem("names");
    localStorage.removeItem("emails");
    localStorage.removeItem("unverifiedEmail");

    setShowChat(false);
    setUsersName("");
    setEmailAddress("");
    setName("");
    setToken("");
  }
};
