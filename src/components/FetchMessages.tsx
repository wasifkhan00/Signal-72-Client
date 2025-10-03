import axios from "axios";
import Endpoints from "../endpoint/endpoints";
import useChatStore from "@store/ChatStore";
import { AESChatKey } from "../encryption/GenerateAES";
import { formatRelativeDate, formatTimestamp } from "../helpers/ChatTimeStamp";

// *******************************************************************************************
export const fetchMessages = async (chatID: string) => {
  const { setShowLoadingInterface, setMessages } = useChatStore.getState();
  setShowLoadingInterface(true);

  try {
    const response = await axios.post(
      Endpoints.fetchChatMessages,
      { chatID },
      { headers: Endpoints.getHeaders() }
    );

    const { success, fetchedMessages } = response.data;

    if (!success || !fetchedMessages) return;

    const decryptedMessages = await Promise.all(
      fetchedMessages.map(async (msg: any) => {
        // If it's an image, don't decrypt the message
        // if (msg.containsImage) return msg;
        // console.log(msg);

        try {
          const decryptedText = await AESChatKey.decryptMessage(
            chatID,
            msg.message.ciphertextBase64,
            msg.message.ivBase64
          );

          return {
            ...msg,
            message: decryptedText,
            formattedDateStamp: formatRelativeDate(msg.timestamp), // 👈 add here
            formattedTimestamp: formatTimestamp(msg.timestamp), // 👈 add here
          };
        } catch (err) {
          console.warn("❌ Failed to decrypt message:", err);
          return {
            ...msg,
            message: "[Decryption failed]",
            formattedDateStamp: formatRelativeDate(msg.timestamp), // 👈 add here
            formattedTimestamp: formatTimestamp(msg.timestamp), // 👈 add here
          };
        }
      })
    );

    setMessages((prev) => [...prev, ...decryptedMessages]);
  } catch (error) {
    console.error("Error fetching/decrypting messages:", error);
  } finally {
    setShowLoadingInterface(false);
  }
};
