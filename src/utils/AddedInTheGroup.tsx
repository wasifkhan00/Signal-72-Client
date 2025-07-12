import React from "react";
import { added_In_The_Group_Container_Style } from "../styles/Styles";
import useChatModulesStore from "@store/ChatModulesStore";

const AddedInTheGroup = () => {
  const { addedInTheGroupBy } = useChatModulesStore();
  return (
    <div style={added_In_The_Group_Container_Style}>
      <div className="user_Joined" style={{ color: "#5d9281" }}>
        {`${addedInTheGroupBy} added you in the group`}
      </div>
    </div>
  );
};

export default AddedInTheGroup;
