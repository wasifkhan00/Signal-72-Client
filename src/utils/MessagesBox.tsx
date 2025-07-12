import React from "react";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";

interface MessagesBoxProps {
  timeStamp: string;
  messages: string;
  Name: string;
}

const MessagesBox: React.FC<MessagesBoxProps> = ({
  messages,
  timeStamp,
  Name,
}) => {
  const { dark } = useAppStore();
  const { selectedChat, isSeen } = useChatStore();

  const fontColor = dark ? "#fff" : "#000";
  const dateObj = new Date(timeStamp);

  const messageTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  let date = "";
  if (isSameDay(dateObj, today)) {
    date = "Today";
  } else if (isSameDay(dateObj, yesterday)) {
    date = "Yesterday";
  } else {
    date = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  const wrapperStyle = {
    display: "flex",
    justifyContent: Name === "You" ? "flex-end" : "flex-start",
    padding: "0.9rem",
    paddingRight: "4rem",
  };

  const messageBoxStyle = {
    background: "transparent",
    boxShadow:
      Name === "You" ? "1px 1px 8px #4caf50" : "1px 1px 8px rgb(71 147 222)",
    border: Name === "You" ? "1px solid #4caf50" : "1px solid rgb(71 147 222)",
    borderRadius: "10px",
    maxWidth: "70%",
  };

  return (
    <div className="messages_Container" style={wrapperStyle}>
      <span style={{ color: fontColor }}>
        {selectedChat?.type === "group" && Name !== "You" && Name}
      </span>

      <div className="receive_message_box" style={messageBoxStyle}>
        <p
          id="receiveMessage"
          style={{ color: fontColor, marginBottom: "0.6rem" }}
        >
          {messages}
        </p>

        {/* Row: Date (left), Time (right) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1rem",
          }}
        >
          <small style={{ fontSize: ".7rem", color: fontColor }}>{date}</small>
          <small style={{ fontSize: ".7rem", color: fontColor }}>
            {messageTime}
          </small>
        </div>

        {/* Row: Seen text (only shown if needed), aligned right */}
        {selectedChat?.type === "private" && Name === "You" && isSeen && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <small style={{ fontSize: ".65rem", color: "#4caf50" }}>Seen</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesBox;
