import axios from "axios";
import Endpoints from "../endpoint/endpoints";
import useChatStore from "@store/ChatStore";
import { AESChatKey } from "../encryption/GenerateAES";

// export const fetchMessages = (chatID: string) => {
//   const { setShowLoadingInterface, setMessages } = useChatStore.getState();
//   setShowLoadingInterface(true);
//   axios
//     .post(
//       Endpoints.fetchChatMessages,
//       { chatID },
//       { headers: Endpoints.getHeaders() }
//     )
//     .then(async (response) => {
//       const { success, message, fetchedMessages } = response.data;

//       if (!success || !fetchedMessages) return;
//       // *************************************************************************&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

//       const decryptedText = await AESChatKey.decryptMessage(
//         chatID,
//         msg.message.ciphertextBase64,
//         msg.message.ivBase64
//       );
//       // *************************************************************************&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

//       if (success) {
//         console.log(fetchedMessages); // setMessages((prev) => [...prev, ...fetchedMessages]);
//         setShowLoadingInterface(false);
//       }
//       setShowLoadingInterface(false);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// };

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

        console.log(msg);

        try {
          const decryptedText = await AESChatKey.decryptMessage(
            chatID,
            msg.message.ciphertextBase64,
            msg.message.ivBase64
          );

          return {
            ...msg,
            message: decryptedText,
          };
        } catch (err) {
          console.warn("❌ Failed to decrypt message:", err);
          return {
            ...msg,
            message: "[Decryption failed]",
          };
        }
      })
    );

    setMessages(decryptedMessages);
  } catch (error) {
    console.error("Error fetching/decrypting messages:", error);
  } finally {
    setShowLoadingInterface(false);
  }
};
