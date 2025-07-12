import React from "react";
import { buttonStyles, button_Container_Style } from "../styles/Styles";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";
import useChatModulesStore from "@store/ChatModulesStore";

const DiscardMedia = () => {
  const { dark } = useAppStore();
  const { setviewImageContainer, setViewImage } = useChatModulesStore();
  const { setDiscardMyMedia } = useChatStore();

  const handleReturnToMedia = () => {
    setDiscardMyMedia(false);
    setviewImageContainer(true);
    // setViewImage(true);
    // setUserIsChagningGroupName(false);
  };

  const handleDiscard = () => {
    setDiscardMyMedia(false);
    setviewImageContainer(false);
    // setViewImage(true);
    // setUserIsChagningGroupName(false);
  };

  const containerStyle: React.CSSProperties = {
    background: dark ? "rgb(0 0 0 / 75%)" : "rgb(255 255 255 / 75%)",
    color: "black",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
  };

  return (
    <div className="Create_Group_Interface_ChatJs_Container">
      <div style={containerStyle} className="createGroupInterfaceContainer">
        <h2 style={{ fontSize: "15px", padding: "1rem 0" }}>Discard Media </h2>
        <h2 style={{ fontSize: "10px" }}>
          This action will discard your selected media. Do you want to proceed?
        </h2>
        <div style={button_Container_Style}>
          <hr />

          <button onClick={handleDiscard} style={buttonStyles}>
            Discard
          </button>
          <button onClick={handleReturnToMedia} style={buttonStyles}>
            Return to Media
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscardMedia;
