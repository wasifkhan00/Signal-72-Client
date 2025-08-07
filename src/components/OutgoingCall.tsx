// components/OutgoingCallModal.tsx
import React from "react";
import "../styles/components/OutgoingCallModal.css"; // Optional
import useChatStore from "@store/ChatStore";
import sockets from "../websockets/websockets";
import { AuthStore } from "@store/AuthStore";

const OutgoingCallModal = () => {
  const calleeName = "wasif mangakore";
  const { setShowOutgoingCall, selectedChat } = useChatStore.getState();
  const { emailAddress } = AuthStore.getState();

  const onCancel = () => {
    const otherEmail =
      selectedChat.chatInitiatedFrom.email === emailAddress
        ? selectedChat.chatInitiatedTo.email
        : selectedChat.chatInitiatedFrom.email;

    if (selectedChat?.type === "private") {
      sockets.emit("cancelCall", {
        to: otherEmail,
        from: emailAddress,
        chatId: selectedChat.chatId,
      });
    }

    setShowOutgoingCall(false);
    // sockets.emit('cancel:call',se)
  };
  return (
    <div className="Create_Group_Interface_ChatJs_Container">
      <div className="outgoing-call-box">
        <p className="callee-text">Calling {calleeName}...</p>
        <button className="cancel-btn" onClick={onCancel}>
          Cancel Call
        </button>
      </div>
    </div>
  );
};

export default OutgoingCallModal;
