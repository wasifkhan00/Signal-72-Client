import axios from "axios";
import Endpoints from "../endpoint/endpoints";
import useChatStore from "@store/ChatStore";

export const fetchMessages = (chatID: string) => {
  const { setShowLoadingInterface, setMessages } = useChatStore.getState();
  setShowLoadingInterface(true);
  axios
    .post(
      Endpoints.fetchChatMessages,
      { chatID },
      { headers: Endpoints.getHeaders() }
    )
    .then((response) => {
      const { success, message, fetchedMessages } = response.data;

      if (success) {
        setMessages((prev) => [...prev, ...fetchedMessages]);
        setShowLoadingInterface(false);
      }
      setShowLoadingInterface(false);
    })
    .catch((error) => {
      console.log(error);
    });
};
