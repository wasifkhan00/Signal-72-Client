import useChatStore from "@store/ChatStore";
import React from "react";
import "../styles/media.css";
import "../styles/Utils/NewUserChat.css";

const NewUserChat = () => {
  const { selectedChat } = useChatStore();
  const new_User_Joined_Message_Style: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    margin: "1rem 0",
  };

  return (
    <div style={new_User_Joined_Message_Style}>
      <div className="user_Joined NewUser" style={{ color: "#ba8229" }}>
        {selectedChat?.type === "group"
          ? "Messages are End to End-Ecncrypted - Not even Signal-72 can see your messages"
          : "Messages are End to End-Ecncrypted"}
      </div>
    </div>
  );
};

export default NewUserChat;
