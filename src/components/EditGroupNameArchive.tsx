import React, { useRef } from "react";
import { buttonStyles, button_Container_Style } from "../styles/Styles";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";

const EditGroupName = () => {
  const regEx = /[a-zA-Z]/;
  const { setUserIsChangingGroupName, dark } = useAppStore();
  const { chatId, setGroupName, setChatList } = useChatStore();

  const groupNameChange = useRef<HTMLInputElement | null>(null);

  const handleChangeGroup = () => {
    const groupInformation = {
      chatId: chatId,
      groupNames: groupNameChange?.current?.value,
    };

    if (
      groupNameChange?.current?.value !== "" &&
      groupNameChange?.current?.value.match(regEx) &&
      groupInformation.chatId !== ""
    ) {
      setGroupName(groupNameChange?.current?.value);
    }
  };

  const handleEnterPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleChangeGroup();
    }
  };

  const handleCancelButton = (e: React.MouseEvent<HTMLButtonElement>) =>
    setUserIsChangingGroupName(false);

  const edit_GroupName_Container_Style: React.CSSProperties = {
    background: dark ? "rgb(0 0 0 / 75%)" : "rgb(255 255 255 / 75%)",
    // height: "17vh",
    color: "black",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
  };

  const Edit_GroupName_Input_Style = {
    color: dark ? "rgb(193 189 189)" : "black",
    fontSize: "10px",
    padding: " .8em",
    height: "25px",
    // width: "20vw",
  };

  return (
    <div className="Create_Group_Interface_ChatJs_Container">
      <div
        style={edit_GroupName_Container_Style}
        className="createGroupInterfaceContainer"
      >
        <input
          maxLength={34}
          onKeyDown={handleEnterPressed}
          ref={groupNameChange}
          style={Edit_GroupName_Input_Style}
          type="text"
          placeholder="Change Group Name... "
        />
        <div style={button_Container_Style}>
          <button onClick={handleChangeGroup} style={buttonStyles}>
            Change Name
          </button>
          <button onClick={handleCancelButton} style={buttonStyles}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGroupName;
