import React from "react";
import "../styles/chat.css";
import useChatStore from "@store/ChatStore";
import useAppStore from "@store/AppStore";
import Image from "next/image";
import DefaultAvatar from "@utils/DefaultAvatar";
import { UserProps } from "../types/User";
import groupIcon from "../assets/images/groupIcon.png";

const User: React.FC<UserProps> = ({
  marginTop,
  showWholeElementCursor,
  showCursor,
  groupName,
  lastMessage,
  time,
  topChatContainer,
  wholeElementClicked,
  onClick,
  chatId,
  lastMessageSentBy,
  userId,
}) => {
  const unreadMessages = useChatStore((state) => state.unreadMessages);
  const dark = useAppStore((state) => state.dark);

  const fontColor = dark ? "#ffff" : "#000000";
  const formattedTime = time
    ? new Date(time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const user_Container_Style: React.CSSProperties = {
    borderRight: unreadMessages ? "7px solid rgb(132 131 128)" : undefined, // unread messages this is shit
    backgroundColor: "transparent",
    // boxShadow: "0 0px 0px 1px rgb(71 147 222)",
    marginTop: marginTop,
    cursor: showWholeElementCursor ? "pointer" : "auto",
  };

  const user_Group_Name_Style: React.CSSProperties = {
    color: fontColor,
    cursor: showCursor ? "pointer" : "auto",
    display: "flex",
    justifyContent: "space-evently",
  };

  return (
    <>
      <section
        data-user-id={userId}
        data-chat-id={chatId}
        data-user-name={lastMessage}
        onClick={wholeElementClicked}
        style={user_Container_Style}
        className={
          topChatContainer === true
            ? " chat_Details topChatContainer"
            : "chat_Details"
        }
      >
        <div className="imgContainers">
          <div className="imageContainerUser">
            <DefaultAvatar name={groupName} />
          </div>

          <div className="nameC">
            <h5 style={user_Group_Name_Style} onClick={onClick}>
              {groupName}
              {/* <Image src={groupIcon} alt="blue tick" width={15} height={15} /> */}
              {/* <Image src={groupIcon} alt="blue tick" width={15} height={15} /> */}
            </h5>

            <h6
              style={{
                color: fontColor,
              }}
            >
              {lastMessage
                ? `${lastMessageSentBy}:${lastMessage}`
                : "Start Conversation"}

              {/* <Image src={groupIcon} alt="group Icon" width={15} height={15} /> */}
            </h6>
          </div>
        </div>

        <h6 style={{ color: fontColor }} className="time">
          {formattedTime}
        </h6>
      </section>
    </>
  );
};

export default User;
