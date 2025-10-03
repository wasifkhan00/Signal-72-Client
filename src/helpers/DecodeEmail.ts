import { AuthStore } from "@store/AuthStore";
import { encodeKey } from "./EncodeKey";

// const { emailAddress } = AuthStore();

export function decodeEmail(encoded: string): string {
  try {
    const step1 = atob(encoded);
    return step1;
  } catch (err) {
    return encoded;
    // return err as string;
  }
}

export function decodeKey(userStatus: any) {
  console.log(userStatus);
  // const myKey = encodeKey(emailAddress);
  // const allKeys = Object.keys(selectedChat.userStatus);

  // const otherKey = allKeys.find((key) => key !== myKey);

  // const otherUserStatus = selectedChat.userStatus[otherKey];

  // console.log("Other user:", decodeKey(otherKey));
  // console.log("My user:", decodeKey(myKey));
  // console.log("all user:", allKeys);

  // console.log("Other user status:", otherUserStatus);
  // return key.replace(/\(dot\)/g, ".").replace(/\(at\)/g, "@");
}
