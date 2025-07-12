import React from "react";
import { user_Left_Container } from "../styles/Styles";
import useChatModulesStore from "@store/ChatModulesStore";

const UserLeft = () => {
  const { showUserLeftGroup } = useChatModulesStore();
  return (
    <div style={user_Left_Container}>
      <div className="user_Joined" style={{ color: "#bf7a83" }}>
        {`${showUserLeftGroup} left the chat`}
      </div>
    </div>
  );
};

export default UserLeft;
