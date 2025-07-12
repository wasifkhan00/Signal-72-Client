import React from "react";
import { Left_Side_Empty_Container_para_Style } from "../styles/Styles";
// import { themeContext } from "../App";
import Svg from "../assets/svg/Svg";
import axios from "axios";
import Endpoints from "../endpoint/endpoints";
import { AuthStore } from "@store/AuthStore";
import useChatStore from "@store/ChatStore";
import useAppStore from "@store/AppStore";
import useChatModulesStore from "@store/ChatModulesStore";
import ChatTypingIcon from "@utils/LeftSideEmptySVG";

//
const LeftSideEmpty = () => {
  //   let { dark, emailAddress, setChatList } = useContext(themeContext); // declared already
  let { emailAddress } = AuthStore();
  const { dark } = useAppStore();
  const {
    setChatList,
    setShowCreateGroupIntf,
    showCreateGroupIntf,
    showLoadingInterface,
    setShowLoadingInterface,
  } = useChatStore();

  const handleCreateGroup = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowCreateGroupIntf(!showCreateGroupIntf);
    // axios
    //   .post(
    //     Endpoints.checkGroupAvailability,
    //     { emailAddress },
    //     { headers: Endpoints.getHeaders() }
    //   )
    //   .then((response) => {
    //     if (response.data !== "Account number not found") {
    //       // props.setShowCreateGroupIntf(false);
    //       // props.setShowCreateGroupIntf(false);

    //       setChatList((prev) => [
    //         ...prev,
    //         {
    //           type: "group",
    //           emails: emailAddress,
    //           chatId: response.data[0].chatId,
    //           groupNames: response.data[0].groupNames,
    //           isAdmin: response.data[0].isAdmin,
    //           addedBy: response.data[0].AddedBy,
    //           member: response.data[0].member,
    //         },
    //       ]);

    //       // props.setChatId(response.data[0].chatId);
    //       // props.setGroupMembers(response.data[0].member);
    //       setShowLoadingInterface(true);
    //       setTimeout(() => {
    //         // props.setShowLoadingInterface(false);
    //         // props.setGroupName(response.data[0].groupNames);
    //         // props.setGotTheGroupName(true);
    //       }, 1000);
    //     } else {
    //       setShowLoadingInterface(false);
    //       // props.setGotTheGroupName(false);
    //     }
    //   });
  };

  const Left_Side_Empty_Container_Style: React.CSSProperties = {
    display: "flex",
    overflow: "hidden",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "15rem",
    justifyContent: "center",
    fontSize: "7rem",
    color: dark ? "#e3e3e3" : "#7c7171",
  };

  return (
    <div
      className="leftSideEmptyContainer"
      style={Left_Side_Empty_Container_Style}
    >
      {showLoadingInterface ? null : (
        <>
          <div className="left_Side_Svg_Container">
            {/* <Svg /> */}

            <ChatTypingIcon />
          </div>
          <h2>Welcome To Snap-Text!</h2>
          <p style={Left_Side_Empty_Container_para_Style}>
            Share media, moments, <br />
            memes and love.
          </p>
          {/* <button className="create_Group_btn" onClick={handleCreateGroup}>
            Create Group
          </button> */}
        </>
      )}
    </div>
  );
};

export default LeftSideEmpty;
