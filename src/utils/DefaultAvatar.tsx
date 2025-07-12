import React from "react";
import { getInitials } from "../utils/NameGenerationFunction"; // adjust the path
import useAppStore from "@store/AppStore";

const DefaultAvatar = ({ name }: { name: string | any }) => {
  const { dark } = useAppStore();
  const initials = getInitials(name);

  return (
    <div
      style={{
        backgroundColor: dark ? "#4B4B4B" : "#007AFF",
        color: "#fff",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold",
        fontSize: "14px",
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
};

export default DefaultAvatar;
