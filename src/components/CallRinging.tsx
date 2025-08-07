// components/IncomingCallModal.tsx
import React from "react";
import "../styles/components/IncomingCallModal.css"; // create this CSS file or use inline style

const IncomingCallModal = ({
  callerName,
  onAnswer,
  onDecline,
}: {
  callerName: string;
  onAnswer: () => void;
  onDecline: () => void;
}) => {
  return (
    <div className="Create_Group_Interface_ChatJs_Container">
      <div className="incoming-call-box">
        <p className="caller-text">{callerName} is calling...</p>
        <div className="button-group">
          <button className="answer-btn" onClick={onAnswer}>
            Answer
          </button>
          <button className="decline-btn" onClick={onDecline}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
