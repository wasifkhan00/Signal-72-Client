import React, { useEffect, useRef } from "react";
import { darkBackgroundImage, whiteBackgroundImage } from "../styles/Styles";
import Create_Group_Interface from "./CreateGroupInterface";
import DiscardMedia from "../utils/DiscardMedia";
import sockets from "../websockets/websockets";
import RightSideEmpty from "./RightSideEmpty";
import Endpoints from "../endpoint/endpoints";
import { AuthStore } from "@store/AuthStore";
import RightSideChat from "./RightSideChat";
import LeftSideEmpty from "./LeftSideEmpty";
import UserExitGroup from "./UserExitGroup";
import EditGroupName from "./EditGroupName";
import PopupMenu from "../utils/EditPopup";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";
import Loading from "../utils/Loading";
import "../styles/chatInterface.css";
import axios from "axios";
import User from "./User";
import Login from "./Login";
import { fetchMessages } from "./FetchMessages";
import { PanelRightCloseIcon } from "lucide-react";
import useChatModulesStore from "@store/ChatModulesStore";

const Chat = () => {
  const { emailAddress } = AuthStore();

  const {
    userIsChangingGroupName,
    showRightSideMobile,
    setShowRightSideMobile,
    isChecked,
    loggOut,
    userIsExitingTheGroup,
    dark,
    addMoreFriendsInGroup,
    setShowDarkAndLightModeDropDown,
  } = useAppStore();
  const {
    messages,
    chatList,
    setChatList,
    showCreateGroupIntf,
    setGroupMembers,
    setUserIsAdmin,
    setChatId,
    setGroupName,
    DiscardMyMedia,
    setDiscardMyMedia,
    lastMessageInfo,
    setLastMessageInfo,
    setShowLoadingInterface,
    showLoadingInterface,
    setSelectedChat,
    selectedChat,
  } = useChatStore();

  const { viewImageContainer } = useChatModulesStore();

  const fetchedChatIds = useRef<Set<string>>(new Set());

  const fontColor = dark ? "#ffff" : "#000000";

  useEffect(() => {
    axios
      .post(
        Endpoints.checkGroupAvailability,
        { emailAddress },
        { headers: Endpoints.getHeaders() }
      )
      .then((response) => {
        const { success, message } = response.data;
        setShowLoadingInterface(true);

        if (success) {
          setShowLoadingInterface(false);
          if (!sockets.connected) sockets.connect();

          setChatList(response.data.response);
        } else {
          setShowLoadingInterface(false);
        }
      })
      .catch((err) => {
        if (err.code === "ERR_NETWORK") {
        }
      });
    //  groupavailibility endpoint underconstruction
  }, []);

  const otherLayerStyle = {
    backgroundImage: chatList
      ? dark
        ? `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7)), url(${darkBackgroundImage})`
        : `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url(${whiteBackgroundImage})`
      : null,
    backgroundSize: "cover", // Add this line
    backgroundPosition: "center", // Add this line
    backgroundRepeat: "no-repeat", // Add this line
    zIndex: "-1",
  };

  const chatMainContainerStyle: React.CSSProperties = {
    zIndex: "1",
    overflow: chatList ? "visible" : "hidden",

    pointerEvents:
      showCreateGroupIntf ||
      DiscardMyMedia ||
      addMoreFriendsInGroup ||
      showLoadingInterface ||
      userIsExitingTheGroup ||
      userIsChangingGroupName
        ? "none"
        : "auto",
    filter:
      showCreateGroupIntf ||
      addMoreFriendsInGroup ||
      DiscardMyMedia ||
      showLoadingInterface ||
      userIsExitingTheGroup ||
      userIsChangingGroupName
        ? "blur(2px)"
        : "none",
  };

  const Create_Group_Interface_Container_ChatJs_Style = {
    display: showCreateGroupIntf || addMoreFriendsInGroup ? "flex" : "none",
  };

  const left_side_Style = {
    background: dark
      ? "linear-gradient(145deg, #1a1a1a, #2c2c2c)"
      : "linear-gradient(145deg, #f4f4f4, #e8e8e8)",
  };

  const left_side_Header_Style = {
    boxShadow: dark ? "0 4px 7px -6px #ffffff" : "0 4px 7px -6px black",
  };

  const wholeElementClicked = (e: React.MouseEvent<HTMLElement>) => {
    if (viewImageContainer) {
      setDiscardMyMedia(true);
      return;
    }
    if (window.matchMedia("(max-width: 768px)").matches) {
      setShowRightSideMobile(true);
      console.log(showRightSideMobile);
    }

    const selectedChatId = e.currentTarget.dataset.chatId;

    if (!selectedChatId) return;

    const matchedChat = chatList.find((chat) => chat.chatId === selectedChatId);
    if (!matchedChat) return;
    if (!fetchedChatIds.current.has(matchedChat.chatId)) {
      fetchMessages(matchedChat.chatId);
      fetchedChatIds.current.add(matchedChat.chatId); // 💾 Mark as fetched
    }

    if (!sockets.connected) sockets.connect();
    setSelectedChat(matchedChat);
    //if later want to differ both events or sockets so this is perfect
    if (matchedChat.type === "group") {
      sockets.emit("chatInitiated", matchedChat.chatId);
    } else {
      sockets.emit("chatInitiated", matchedChat.chatId);
      // implementing the seen message logic setIsSeen to true
      // if (
      //   matchedChat.type === "private" &&
      //   matchedChat.lastMessage &&
      //   !matchedChat.lastMessage.isSeen &&
      //   matchedChat.lastMessage.sender !== "You"
      // ) {
      //   sockets.emit("message:seen", {
      //     chatId: matchedChat.chatId,
      //     messageId: matchedChat.lastMessage,
      //   });
      // }
    }
  };

  return (
    <>
      {userIsExitingTheGroup ? <UserExitGroup /> : null}
      {userIsChangingGroupName ? <EditGroupName /> : null}
      {/* Discard Media rendered but didnt implement any logic  */}
      {DiscardMyMedia ? <DiscardMedia /> : null}
      {showLoadingInterface ? <Loading /> : null}
      {loggOut ? (
        <>
          <Login />
        </>
      ) : (
        <>
          <div
            className="Create_Group_Interface_ChatJs_Container chatInterfAddFriends"
            style={Create_Group_Interface_Container_ChatJs_Style}
          >
            {addMoreFriendsInGroup ? (
              "da"
            ) : (
              //  addFriends after login logic will be implemented here
              <Create_Group_Interface />
            )}
          </div>

          <div
            className="main"
            style={chatMainContainerStyle}
            data-testid="chatMainContainer"
          >
            {/* <div //for including the strip behind to sidebar
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <PanelRightCloseIcon />
            </div> */}

            <div
              id="sidebar"
              className={
                chatList
                  ? showRightSideMobile
                    ? "left_side_User leftSideMobileUser"
                    : "left_side_User"
                  : isChecked
                  ? "left_side leftSideMobile"
                  : "left_side"
              }
              onClick={(e) => {
                setShowDarkAndLightModeDropDown(false);

                if (viewImageContainer) {
                  setDiscardMyMedia(true);
                  return;
                }
              }}
              style={left_side_Style}
            >
              <header style={left_side_Header_Style} className="sidebarHeader">
                {/* <div className="create_Group"> */}
                <>
                  <h4 style={{ color: fontColor }}>Chats</h4>
                </>
                <div style={{ width: "1.4rem" }}>
                  <PopupMenu />
                </div>
                {/* </div> */}
              </header>

              {/* <div style={{ width: "inherit" }}> */}
              <div>
                {chatList && chatList.length > 0 ? (
                  chatList.map((chats, index) => {
                    return (
                      <React.Fragment key={chats._id || index}>
                        <User
                          chatId={chats.chatId}
                          showWholeElementCursor={true}
                          wholeElementClicked={wholeElementClicked}
                          groupName={
                            chats.type === "group"
                              ? chats.groupNames
                              : chats.chatInitiatedFrom.email === emailAddress
                              ? chats.chatName
                              : chats.chatInitiatedFrom.userName
                          }
                          lastMessage={
                            lastMessageInfo
                              ? lastMessageInfo.message > 15
                                ? `${lastMessageInfo.message.substring(
                                    0,
                                    20
                                  )}...`
                                : lastMessageInfo.message
                              : "Start conversation now"
                          }
                          lastMessageSentBy={lastMessageInfo.userName}
                          time={
                            lastMessageInfo ? lastMessageInfo.timestamp : null
                          }
                        />
                      </React.Fragment>
                    );
                  })
                ) : (
                  <LeftSideEmpty />
                )}
              </div>
            </div>
            {chatList && chatList.length > 0 ? (
              <>
                <RightSideChat />
              </>
            ) : (
              <RightSideEmpty />
            )}
          </div>
        </>
      )}
    </>
  );
};
export default Chat;
