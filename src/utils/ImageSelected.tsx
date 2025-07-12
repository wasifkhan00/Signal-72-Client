import React from "react";
import { time_And_Date_Container_ImageSelectedView_Style } from "../styles/Styles";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";
import TickIcon from "./SingleTick";
// import { CheckDouble } from "lucide-react"; // or use your own tick icon

interface ImageSelectedProps {
  onClick: (e: React.MouseEvent<HTMLImageElement>) => void;
  timeStamp: string;
  Name: string;
  imageSource: string;
}

const ImageSelected: React.FC<ImageSelectedProps> = ({
  onClick,
  timeStamp,
  Name,
  imageSource,
}) => {
  const { dark } = useAppStore();
  const { selectedChat, isSeen } = useChatStore();

  const fontColor = dark ? "#fff" : "#000";
  const dateObj = new Date(timeStamp);

  const Time = dateObj.toLocaleTimeString("en-US", {
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

  return (
    <div
      className="image-card-wrapper"
      style={{
        display: "flex",
        justifyContent: Name === "You" ? "flex-end" : "flex-start",
        padding: "0.3rem 0.5rem", // reduced top padding
      }}
    >
      <div
        style={{
          maxWidth: "260px",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "transparent",
          boxShadow: "0 0 6px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src={imageSource}
          alt="chat image"
          onClick={onClick}
          className="sendUserImage"
          style={{
            width: "100%",
            cursor: "pointer",
            borderRadius: "10px 10px 0 0",
          }}
        />

        <div
          style={{
            ...time_And_Date_Container_ImageSelectedView_Style,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.4rem 0.5rem",
          }}
        >
          {/* Name will only be shown if it's a group and it's not the current user */}
          <div style={{ fontSize: "0.7rem", color: fontColor }}>
            {selectedChat?.type === "group" && Name !== "You" ? Name : null}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
              justifyContent: "flex-end", // make sure it's on the right
            }}
          >
            {/* Date should always be on the left */}
            <small style={{ fontSize: "0.7rem", color: fontColor }}>
              {date}
            </small>
            {/* Time */}
            <span style={{ fontSize: "0.75rem", color: fontColor }}>
              {Time}
            </span>
            {/* Seen ticks logic: only for private chat and your own message */}
            {selectedChat?.type === "private" && Name === "You" && isSeen && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "12px", color: "green" }}>seen</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSelected;
