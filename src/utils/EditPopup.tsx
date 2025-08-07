import React, { useContext, useState } from "react";
import "../styles/dropdown.css";
// import { themeContext } from "../App";
import blackEditIcon from "../assets/images/editIconBlack.png";
import WhiteEditIcon from "../assets/images/editIconWhite.png";
import useAppStore from "@store/AppStore";
import useChatModulesStore from "@store/ChatModulesStore";
import useChatStore from "@store/ChatStore";
import Image from "next/image";

const PopupMenu = () => {
  let { dark } = useAppStore();
  const {
    showDropDown,
    setShowDropDown,
    setWarningMsg,
    setviewImageContainer,
    viewImageContainer,
  } = useChatModulesStore();
  const {
    selectedGroupMemberPayload,
    showCreateGroupIntf,
    setSelectedGroupMemberPayload,
    setShowCreateGroupIntf,
    setIsModePrivateChat,

    isModePrivateChat,
    setDiscardMyMedia,
  } = useChatStore();
  //   const [showDropDown, setShowDropDown] = useState(false); //lmoved

  const drop_Down_Container_Style: React.CSSProperties = {
    backgroundColor: dark ? "rgb(59, 59, 59)" : "rgb(246, 246, 246)",
    left: "21dvw",
  };

  const fontColor: React.CSSProperties = {
    color: dark ? "white" : "black",
  };

  const showDropDownHandle = () => {
    if (viewImageContainer) {
      setDiscardMyMedia(true);
      return;
    }
    setShowDropDown(!showDropDown);
  };

  const handleCreateContact = () => {
    setSelectedGroupMemberPayload([]);
    setWarningMsg("");
    setIsModePrivateChat(true);
    setShowCreateGroupIntf(true);
    setShowDropDown(false);
  };
  const handleCreateGroup = () => {
    setSelectedGroupMemberPayload([]);

    if (isModePrivateChat) {
      setIsModePrivateChat(false);
    }
    setWarningMsg("");
    setShowCreateGroupIntf(true);
    setShowDropDown(false);
  };

  return (
    <>
      <Image
        src={dark ? WhiteEditIcon : blackEditIcon}
        style={{ width: "100%", height: "auto" }} // stretch to parent
        alt="menu"
        onClick={showDropDownHandle}
      />

      {showDropDown ? (
        <div className="mainDropDownContainer">
          <div className="dropdowncontainer" style={drop_Down_Container_Style}>
            <div
              className="DD_firstChild common"
              style={fontColor}
              onClick={handleCreateContact}
            >
              Create Contact
            </div>
            <hr />
            <div
              className="DD_secondChild common"
              style={fontColor}
              onClick={handleCreateGroup}
            >
              Create Group
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default PopupMenu;
