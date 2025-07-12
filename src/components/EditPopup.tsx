import React from "react";
import "../styles/dropdown.css";
import blackEditIcon from "../assets/images/editIconBlack.png";
import WhiteEditIcon from "../assets/images/editIconWhite.png";
import useChatModulesStore from "@store/ChatModulesStore";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";
import Image from "next/image";

const PopupMenu = () => {
  const { dark } = useAppStore();
  const { showDropDown, setShowDropDown } = useChatModulesStore();

  const drop_Down_Container_Style = {
    backgroundColor: dark ? "rgb(59, 59, 59)" : "rgb(246, 246, 246)",
    left: "21dvw",
  };

  const fontColor = {
    color: dark ? "white" : "black",
  };

  const showDropDownHandle = () => {
    setShowDropDown(!showDropDown);
  };

  const handleCreateContact = () => {
    setShowDropDown(false);
  };
  const handleCreateGroup = () => {
    setShowDropDown(false);
  };

  return (
    <>
      <Image
        src={dark ? WhiteEditIcon : blackEditIcon}
        style={{ width: "100%" }}
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
