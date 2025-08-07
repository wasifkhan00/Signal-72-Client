import React, { useEffect, useRef } from "react";
import { MdOutlineModeEditOutline, MdCall, MdVideoCall } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import profilePicture from "../assets/images/profile.png";
import AddedInTheGroup from "../utils/AddedInTheGroup";
import { IoIosSearch } from "react-icons/io";
import "../styles/chat.css";
import "../styles/media.css";
import "../styles/components/RightSideChat.css";
import ImageSelected from "../utils/ImageSelected";
import SerndMessage from "./SendMessage";
import MessagesBox from "../utils/MessagesBox";
import NewUserChat from "../utils/NewUserChat";
import ViewImage from "../utils/ViewImage";
import Dropdown from "../utils/DropDown";
import UserLeft from "../utils/UserLeft";
import axios from "axios";
import Endpoints from "../endpoint/endpoints";
import sockets from "../websockets/websockets";
import SmallSpinnerLoader from "../utils/SmallSpinnerLoader";
import TypingIndicator from "../utils/TypingIndicator";
import useChatModulesStore from "@store/ChatModulesStore";
import useChatStore from "@store/ChatStore";
import { AuthStore } from "@store/AuthStore";
import useAppStore from "@store/AppStore";
import Image from "next/image";
import DefaultAvatar from "@utils/DefaultAvatar";
import RightSideEmpty from "./RightSideEmpty";
import { handleAudioCall } from "../encryption/AudioCall";

const RightSideChat = () => {
  const messagesArea = useRef<HTMLElement | null>(null);
  const isMobile = window.innerWidth <= 580;

  const {
    imageUrl,
    setImageUrl,
    imageUrlView,
    setImageUrlView,
    viewImage,
    setViewImage,
    showWait,
    setShowWait,
    viewImageContainer,
    setviewImageContainer,
    today,
    setToday,
    yesterday,
    setYesterday,
    showUserLeftGroup,
    setShowUserLeftGroup,
    groupMems,
    setGroupMems,
    addedInTheGroupBy,
    setAddedInTheGroupBy,
    editGroupName,
    setEditGroupName,
    you,

    setYou,
  } = useChatModulesStore();
  const {
    setSendImage,
    uploadedImageDimensions,
    setUploadedImageDimensions,
    setUnreadMessages,
    unreadMessages,
    messages,
    typing,
    heIsTyping,
    groupMembers,
    chatList,
    groupName,
    userIsAdmin,
    setDiscardMyMedia,
    DiscardMyMedia,
    selectedChat,
    showIncomingCall,
    showOutgoingCall,
    chatId,
    userOnlineStatus,
  } = useChatStore();
  const { emailAddress } = AuthStore();

  // useEffect(() => {
  //   console.log(userOnlineStatus);
  // }, [userOnlineStatus]);

  const {
    dark,
    setShowDarkAndLightModeDropDown,
    showDarkAndLightModeDropDown,
    setUserIsExitingTheGroup,
    setUserIsChangingGroupName,
    showRightSideMobile,
    setShowRightSideMobile,
    setAddMoreFriendsInGroup,
  } = useAppStore();

  const fontColor = dark ? "#ffff" : "#000000";

  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesArea.current?.scrollTo({
        top: messagesArea.current.scrollHeight,
        behavior: "smooth",
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [messages]);

  useEffect(() => {
    const WhoAddedTheUser = async () => {
      await axios
        .post(
          Endpoints.fetchUserChats,
          { emailAddress },
          { headers: Endpoints.getHeaders() }
        )
        .then((response) => {
          if (response.status !== 200) {
            throw Error("Server denied to take requests at the moment");
          }
          if (response.data !== "Account number not found") {
            if (response.data[0].addedBy !== "None") {
              setAddedInTheGroupBy(response.data[0].addedBy);
            }
          }
        })
        .catch((err) => console.warn(err.message));
    };
  }, []);

  useEffect(() => {
    sockets.on("userHasLeftGroup", (data) => {
      setShowUserLeftGroup({ UserWhoLeft: data.emails });
    });
  }, []);

  const handleImageView = (e: React.MouseEvent<HTMLImageElement>) => {
    if (viewImageContainer || DiscardMyMedia) return;
    const img = new window.Image();
    const target = e.target as HTMLImageElement;

    img.onload = () => {
      setUploadedImageDimensions({
        width: img.width,
        height: img.height,
      });
    };

    img.src = target.currentSrc;

    setImageUrlView(target.currentSrc);
    setTimeout(() => {
      setViewImage(true);
    }, 50);
  };

  const mouserEnterHover = () => setEditGroupName(true);

  const mouserLeftHover = () => setEditGroupName(false);

  const right_Side_Header_Styles: React.CSSProperties = {
    background: dark
      ? "linear-gradient(145deg, #1a1a1a, #2c2c2c)"
      : "linear-gradient(145deg, #f4f4f4, #e8e8e8)",

    boxShadow: dark ? "0 4px 7px -6px #ffffff" : "0 4px 7px -6px black",
    filter: viewImageContainer ? "blur(2px)" : "none",
  };

  const right_side_Style: React.CSSProperties = {
    backgroundColor: dark ? "#404040" : "rgb(255, 255, 255)",
  };

  const group_Name_Style: React.CSSProperties = {
    color: fontColor,
    display: "flex",
    alignItems: "center",
  };

  const send_Image_style = {
    resizeMode: "cover",
    width:
      uploadedImageDimensions !== null
        ? uploadedImageDimensions.width < 850
          ? `${uploadedImageDimensions.width}px`
          : "100%"
        : null,

    height:
      uploadedImageDimensions !== null
        ? `${uploadedImageDimensions.height}px`
        : null,
  };

  const show_Image_Before_Sending_Style = {
    padding: "0.3rem 0.5rem",
    color: dark ? "#fff" : "rgb(10, 10, 10)",
  };

  const handleSendImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSendImage(true);
    setviewImageContainer(false);
  };

  // const handleCloseViewImage = (e) => {
  //   setviewImageContainer(false);
  // };

  const handleShowAddMoreFriends = (
    e: React.MouseEvent<HTMLButtonElement | SVGElement>
  ) => {
    setAddMoreFriendsInGroup(true);
    setShowDarkAndLightModeDropDown(false);
    setUserIsChangingGroupName(false);
    setUserIsExitingTheGroup(false);
  };

  const handleShowSettings = (
    e: React.MouseEvent<HTMLButtonElement | SVGElement>
  ) => {
    const target = e.target as HTMLElement | SVGElement;

    // Toggle "showDropDown" class safely
    if (target instanceof SVGElement) {
      const className = target.className.baseVal;
      target.classList.toggle("showDropDown");

      if (className.includes("showDropDown")) {
        setShowDarkAndLightModeDropDown(true);
      } else {
        setShowDarkAndLightModeDropDown(!showDarkAndLightModeDropDown);
      }
    } else if (target instanceof HTMLElement) {
      const className = target.className;
      target.classList.toggle("showDropDown");

      if (className.includes("showDropDown")) {
        setShowDarkAndLightModeDropDown(true);
      } else {
        setShowDarkAndLightModeDropDown(!showDarkAndLightModeDropDown);
      }
    }
  };

  const viewImageStyle: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    left: isMobile ? "50%" : "60dvw",
    transform: "translate(-50%, -50%)",
    background: dark
      ? "linear-gradient(145deg, #1a1a1a, #2c2c2c)"
      : "linear-gradient(145deg, #f4f4f4, #e8e8e8)",
    // transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(5px)",
    padding: "1rem",
    borderRadius: "10px",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
    maxWidth: "90vw",
    maxHeight: "90vh",
    minWidth: showWait ? "500px" : "auto",
    minHeight: showWait ? "450px" : "auto",
    overflow: "auto",
    zIndex: 9999,
  };

  const dummyStyleFOrDiv: React.CSSProperties = {
    display: showWait ? "flex" : "none",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: dark
      ? "linear-gradient(145deg, #1a1a1a, #2c2c2c)"
      : "linear-gradient(145deg, #f4f4f4, #e8e8e8)",
    padding: "1rem",
    borderRadius: "8px",
    zIndex: 10,
  };

  const imageTemporaryStyle: React.CSSProperties = {
    display: showWait ? "none" : "block",
    maxWidth: "100%",
    maxHeight: "80vh",
    height: "auto",
    width: "auto",
    borderRadius: "8px",
    objectFit: "contain",
  };

  return (
    <>
      {viewImageContainer ? (
        <div className="viewImage" style={viewImageStyle}>
          <div style={dummyStyleFOrDiv}>
            <SmallSpinnerLoader makeMarginAuto={true} />
            <p style={{ margin: "1rem -2rem", fontSize: "11px" }}>
              Loading Image Please Wait..
            </p>
          </div>
          <img src={imageUrl} style={imageTemporaryStyle} alt="previewImage" />

          <button
            style={{ display: showWait ? "none" : "flex" }}
            onClick={handleSendImage}
          >
            Send
          </button>
        </div>
      ) : null}
      {viewImage ? (
        <div
          className="viewImage rcvImg"
          id="recvd"
          style={{
            background: dark ? "rgb(74 72 72)" : "rgb(255 255 255 / 81%)",
          }}
        >
          <ViewImage setViewImage={setViewImage} imageSource={imageUrlView} />
        </div>
      ) : null}
      {selectedChat ? (
        <div
          className="right_side"
          onClick={(e) => {
            if (viewImageContainer) {
              setDiscardMyMedia(true);
            }
          }}
          id={showRightSideMobile ? "showRightSideMobileUser" : ""}
          style={right_side_Style}
        >
          <header style={right_Side_Header_Styles}>
            <div className="imgContainer">
              <div className="containerHeaderImage">
                {selectedChat && (
                  <DefaultAvatar
                    name={
                      selectedChat.type === "group"
                        ? selectedChat.groupNames
                        : selectedChat.chatName
                    }
                  />
                )}
              </div>
              <div className="nameUsersContainer">
                <h3
                  onMouseEnter={mouserEnterHover}
                  onMouseLeave={mouserLeftHover}
                  style={group_Name_Style}
                >
                  {
                    selectedChat.type === "group"
                      ? selectedChat.groupNames
                      : selectedChat?.chatInitiatedFrom.email === emailAddress
                      ? selectedChat?.chatName // your custom name for the other user
                      : selectedChat?.chatInitiatedFrom.userName // you are the receiver, show their name
                  }
                  {editGroupName ? (
                    <MdOutlineModeEditOutline
                      onClick={(e) => {
                        setShowDarkAndLightModeDropDown(false);
                        setUserIsChangingGroupName(true); //imprted from icons
                      }}
                    />
                  ) : null}
                </h3>
                <h6 style={{ color: "gray" }}>
                  {selectedChat.type === "group" ? (
                    <>
                      You
                      {selectedChat.members?.length > 0 &&
                        ", " +
                          selectedChat.members
                            .map((m: any) => m.userName)
                            .join(", ")}
                    </>
                  ) : (
                    (() => {
                      const otherUserEmail =
                        selectedChat.chatInitiatedTo.email === emailAddress
                          ? selectedChat.chatInitiatedFrom.email
                          : selectedChat.chatInitiatedTo.email;

                      return userOnlineStatus?.status;
                    })()
                  )}
                </h6>
              </div>
            </div>

            <label htmlFor="search_account">
              <div className="searchAccount_input">
                {userIsAdmin ? (
                  <span>
                    {/* <IoIosSearch
                    onClick={handleShowAddMoreFriends}
                    className="search_account"
                    style={{ color: fontColor }} //imprted from icons
                  /> */}
                  </span>
                ) : null}
                <span>
                  <MdVideoCall
                    className="search_account"
                    style={{ color: fontColor }}
                  />
                  <MdCall
                    onClick={
                      showIncomingCall || showOutgoingCall
                        ? undefined
                        : handleAudioCall
                    }
                    className="search_account"
                    style={{ color: fontColor }}
                  />
                  <IoSettingsSharp
                    onClick={handleShowSettings}
                    className="search_account" //imprted from icons
                    style={{ color: fontColor }}
                  />
                </span>

                {showDarkAndLightModeDropDown ? <Dropdown /> : null}
              </div>
            </label>
          </header>
          {/* messages area where users messages boxes are seen */}
          <main
            ref={messagesArea}
            onClick={(e) => setShowDarkAndLightModeDropDown(false)}
            style={{
              background: dark
                ? "linear-gradient(145deg, #0f0f0f, #1b1b1b)"
                : "linear-gradient(145deg, #e5e5e5, #d6d6d6)",
            }}
          >
            <NewUserChat />

            {addedInTheGroupBy !== "" ? <AddedInTheGroup /> : null}

            {messages && selectedChat && messages.length > 0
              ? messages
                  .filter((msg) => msg.chatId === selectedChat.chatId)
                  .map((messageBox, index) => {
                    if (!messageBox.containsImage) {
                      return (
                        <React.Fragment key={messageBox._id || index}>
                          <MessagesBox
                            // messageTime={messageBox.timestamp}
                            timeStamp={messageBox.timestamp}
                            messages={messageBox.message}
                            // date={messageBox.timestamp}
                            Name={
                              messageBox.email === emailAddress
                                ? "You"
                                : messageBox.name
                            }
                          />
                        </React.Fragment>
                      );
                    } else {
                      return (
                        <React.Fragment key={messageBox._id || index}>
                          <ImageSelected
                            onClick={handleImageView}
                            timeStamp={messageBox.timestamp}
                            Name={
                              messageBox.email === emailAddress
                                ? "You"
                                : messageBox.name
                            }
                            imageSource={messageBox.message}
                          />
                        </React.Fragment>
                      );
                    }
                  })
              : null}
            {Object.keys(showUserLeftGroup).length !== 0 ? <UserLeft /> : null}
            {typing && <TypingIndicator />}
          </main>

          <section style={right_Side_Header_Styles}>
            <SerndMessage />
          </section>
        </div>
      ) : (
        <RightSideEmpty />
      )}
    </>
  );
};

export default RightSideChat;
