import React, { useEffect, useRef } from "react";
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
import "../styles/components/CreateGroupInterface.css";
import "../styles/media.css";
import "../styles/components/Chat.css";
import axios from "axios";
import User from "./User";
import Login from "./Login";
import { fetchMessages } from "./FetchMessages";
import useChatModulesStore from "@store/ChatModulesStore";
import { AESChatKey } from "../encryption/GenerateAES";
import { decryptRSAKeyFromSessionKey } from "../encryption/DecryptRSASessionKey";
import { removeDraftChat } from "../helpers/DraftChats";
import { decodeEmail, decodeKey } from "../helpers/DecodeEmail";
import fetchDraftChats from "../helpers/FetchDrafts";
import { handleTabFocus } from "../helpers/ScreenVisibility";
import { requestNotificationPermission } from "./Notifications";
import {
  chatMainContainerStyle,
  Create_Group_Interface_Container_ChatJs_Style,
  left_side_Header_Style,
  left_side_Style,
} from "@styles/components/Chat";
import { getMicrophoneAccess } from "../helpers/MicrophonePermission";
import { playMicAudio } from "../Testing/AudioTesting";
import IncomingCallModal from "./CallRinging";
import OutgoingCallModal from "./OutgoingCall";
import React, { useState } from "react";

const Chat = () => {
  const { emailAddress, setRSAKeyPairs } = AuthStore();

  const [ringingUserData, setRingingUserData] = useState<any>(null);

  const didRunRef = useRef(false);

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
    chatList,
    setChatList,
    DiscardMyMedia,
    setDiscardMyMedia,
    setLastMessageInfo,
    setShowLoadingInterface,
    showLoadingInterface,
    showIncomingCall,
    setShowIncomingCall,
    setSelectedChat,
    setUserOnlineStatus,
    userOnlineStatus,
    showCreateGroupIntf,
    selectedChat,
    selectedGroupMemberPayload,
    showOutgoingCall,
    setShowOutgoingCall,
    setMessages,
  } = useChatStore();

  const { viewImageContainer } = useChatModulesStore();

  const fetchedChatIds = useRef<Set<string>>(new Set());

  const fontColor = dark ? "#ffff" : "#000000";

  useEffect(() => {
    const drafts = fetchDraftChats();

    if (drafts.length > 0) {
      setChatList((prevChats) => {
        const filtered = prevChats.filter(
          (chat) => !drafts.some((draft: any) => draft.chatId === chat.chatId)
        );

        return [...drafts, ...filtered];
      });
    }

    const handleNewChatInitiated = (newChat: any) => {
      let chatWithDecodedKeys = newChat;

      if (newChat.encryptedAESKeys) {
        const encryptedAESKeys = newChat.encryptedAESKeys;

        const decodedAESKeyMap = Object.fromEntries(
          Object.entries(encryptedAESKeys).map(([encodedEmail, aesKey]) => {
            const decoded = decodeEmail(encodedEmail);
            return [decoded, aesKey];
          })
        );

        chatWithDecodedKeys = {
          ...newChat,
          encryptedAESKeys: decodedAESKeyMap,
        };
      }

      setChatList((prevChats) => {
        const filtered = prevChats.filter(
          (chat) => chat.chatId !== chatWithDecodedKeys.chatId
        );
        return [chatWithDecodedKeys, ...filtered];
      });
    };

    const handleNewPrivateChatInitiated = async ({
      messagePayload,
      newchat,
    }) => {
      const decodedAESKeyMap = Object.fromEntries(
        Object.entries(newchat.encryptedAESKeys).map(
          ([encodedEmail, aesKey]) => {
            const decoded = decodeEmail(encodedEmail);
            return [decoded, aesKey];
          }
        )
      );

      const updatedChat = {
        ...newchat,
        encryptedAESKeys: decodedAESKeyMap,
      };
      setChatList((prevChats) => {
        const filtered = prevChats.filter(
          (chat) => chat.chatId !== updatedChat.chatId
        );
        return [updatedChat, ...filtered];
      });

      removeDraftChat(newchat.chatId);

      console.log(decodedAESKeyMap[emailAddress]);
      AESChatKey.storeKeyLocally(
        newchat.chatId,
        decodedAESKeyMap[emailAddress]
      );
      console.log(newchat.encryptedAESKeys);

      console.log(decodedAESKeyMap);
      console.log(messagePayload);

      try {
        const decryptedText = await AESChatKey.decryptMessage(
          messagePayload.chatId,
          messagePayload.ciphertextBase64,
          messagePayload.ivBase64
        );
        setMessages((prevMessages) => [...prevMessages, decryptedText]);
      } catch (err) {
        console.warn("❌ Failed to decrypt message:", err);
      }
    };

    const handleUpdateLastMessage = async (messagePayload: any) => {
      let decryptedLastMessageInfo = messagePayload;

      try {
        const { ciphertextBase64, ivBase64 } = messagePayload.message;
        const decrypted = await AESChatKey.decryptMessage(
          messagePayload.chatId,
          ciphertextBase64,
          ivBase64
        );

        decryptedLastMessageInfo = {
          ...messagePayload,
          message: decrypted,
        };
      } catch (error) {
        console.error("Decryption failed:", error);
      }

      setLastMessageInfo(decryptedLastMessageInfo);
    };

    const handleUserOnline = ({ user, status }) => {
      setUserOnlineStatus({
        user: user,
        status: status,
      });
    };

    const handleRinging = (callPayload) => {
      setShowIncomingCall(true);
      setRingingUserData(callPayload);
      console.log(callPayload);
      // sockets.emit("call:accepted", callPayload);
    };

    // playMicAudio(microphone);
    const handleCallAccepted = async (callPayload) => {
      const getAccess = await getMicrophoneAccess();

      const microphone = getAccess.Stream;

      alert("call has been accepted by the user ");
    };

    const userCancelledCall = (callCancelledPayload) => {
      setShowIncomingCall(false);
      alert(`1 Missed Call From ${callCancelledPayload.from}`);
    };

    const userDeclinedCall = () => {
      setShowOutgoingCall(false);
      alert("regretfully the user has declined the call he might be busy");
    };

    sockets.on("call:acceptedByUser", handleCallAccepted);
    sockets.on("newChatInitiated", handleNewChatInitiated);
    sockets.on("newPrivateChatInitiated", handleNewPrivateChatInitiated);
    sockets.on("updateLastMessage", handleUpdateLastMessage);
    sockets.on("updateUserStatus", handleUserOnline);
    sockets.on("ringing", handleRinging);
    sockets.on("userCancelledCall", userCancelledCall);
    sockets.on("userDeclinedCall", userDeclinedCall);

    return () => {
      sockets.off("newChatInitiated", handleNewChatInitiated);
      sockets.off("newPrivateChatInitiated", handleNewPrivateChatInitiated);
      sockets.off("updateLastMessage", handleUpdateLastMessage);
      sockets.off("updateUserStatus", handleUserOnline);
      sockets.off("ringing", handleRinging);
      sockets.off("call:acceptedByUser", handleCallAccepted);
      sockets.off("userCancelledCall", userCancelledCall);
      sockets.off("userDeclinedCall", userDeclinedCall);
    };
  }, []);
  const audioCallAccepted = () => {
    // sockets.emit("call:accepted", callPayload);
  };

  useEffect(() => {
    console.log(selectedGroupMemberPayload);
  }, [selectedGroupMemberPayload]);

  const audioCallDeclined = () => {
    setShowIncomingCall(false);
    if (ringingUserData) {
      sockets.emit("callDeclined", ringingUserData);
    }
  };

  useEffect(() => {
    handleTabFocus();

    if (didRunRef.current) return;
    didRunRef.current = true;

    if (Notification.permission === "default") {
      requestNotificationPermission();
    }

    if (!sockets.connected) sockets.connect();
    sockets.emit("onlineUser", {
      userId: emailAddress, // or email
    });
    axios
      .post(
        Endpoints.fetchUserChats,
        { emailAddress },
        { headers: Endpoints.getHeaders() }
      )
      .then((response) => {
        const { success, message } = response.data;
        setShowLoadingInterface(true);
        if (success) {
          setShowLoadingInterface(false);
          if (!sockets.connected) sockets.connect();

          const updatedChats = response.data.response.map((chats: any) => {
            if (chats.encryptedAESKeys) {
              const encryptedAESKeys = chats.encryptedAESKeys;

              const decodedAESKeyMap = Object.fromEntries(
                Object.entries(encryptedAESKeys).map(
                  ([encodedEmail, aesKey]) => {
                    const decoded = decodeEmail(encodedEmail);
                    return [decoded, aesKey];
                  }
                )
              );

              return {
                ...chats,
                encryptedAESKeys: decodedAESKeyMap,
              };
            }
            return chats;
          });
          setChatList(updatedChats);
        } else {
          setShowLoadingInterface(false);
        }
      })
      .catch((err) => {
        if (err.code === "ERR_NETWORK") {
        }
      });
  }, []);

  useEffect(() => {
    (async () => {
      const keys = await decryptRSAKeyFromSessionKey();

      if (keys) {
        setRSAKeyPairs({
          rsaPrivateKey: keys.rsaPrivateKey,
          rsaPublicKey: keys.rsaPublicKey,
        });
      } else {
        console.error("Failed to load RSA keys.");
      }
    })();
  }, []);

  const wholeElementClicked = async (e: React.MouseEvent<HTMLElement>) => {
    if (viewImageContainer) {
      setDiscardMyMedia(true);
      return;
    }
    if (window.matchMedia("(max-width: 768px)").matches) {
      setShowRightSideMobile(true);
    }

    const selectedChatId = e.currentTarget.dataset.chatId;
    if (!selectedChatId) return;

    const matchedChat = chatList.find((chat) => chat.chatId === selectedChatId);
    if (!matchedChat) return;
    if (!fetchedChatIds.current.has(matchedChat.chatId)) {
      fetchMessages(matchedChat.chatId);
      fetchedChatIds.current.add(matchedChat.chatId);
    }

    if (!sockets.connected) sockets.connect();
    setSelectedChat(matchedChat);

    if (matchedChat.type === "group") {
      const encryptedAESKEY = matchedChat.encryptedAESKeys[emailAddress];
      if (encryptedAESKEY) {
        const { rsaPrivateKey } = AuthStore.getState();
        try {
          const decryptAESChatKey = await AESChatKey.decryptAESKeyForChat(
            encryptedAESKEY,
            rsaPrivateKey
          );
          await AESChatKey.storeKeyLocally(
            matchedChat.chatId,
            matchedChat.encryptedAESKeys[emailAddress]
          );
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("key didnt match with private email address here as well");
      }

      sockets.emit("chatInitiated", matchedChat.chatId);
    } else {
      //private chat

      // const decodeEMail = decodeKey(matchedChat.userStatus);
      const decodedUserStatus: Record<string, string> = {};

      for (const key in matchedChat.userStatus) {
        const decodedKey = key.replace("(at)", "@").replace("(dot)", ".");
        decodedUserStatus[decodedKey] = matchedChat.userStatus[key];
      }

      const otherUserEmail = Object.keys(decodedUserStatus).find(
        (email) => email !== emailAddress
      );

      if (
        decodedUserStatus &&
        Object.keys(decodedUserStatus).length > 0 &&
        userOnlineStatus.user !== otherUserEmail
      ) {
        setUserOnlineStatus({
          user: otherUserEmail!,
          status: decodedUserStatus[otherUserEmail],
        });
      }

      const encryptedAESKEY = matchedChat.encryptedAESKeys[emailAddress];
      if (encryptedAESKEY) {
        const { rsaPrivateKey } = AuthStore.getState();

        try {
          const decryptAESChatKey = await AESChatKey.decryptAESKeyForChat(
            encryptedAESKEY,
            rsaPrivateKey
          );

          await AESChatKey.storeKeyLocally(
            matchedChat.chatId,
            matchedChat.encryptedAESKeys[emailAddress]
          );
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("key didnt matched with emailaddress");
      }

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
    // generateAndStoreRSAKeyPair("mamashmeratargadde");
    // unlockPrivateKey("mamashmeratargadde");
  };
  const Create_Group_Interface_Container_ChatJs_Style = {
    display: showCreateGroupIntf ? "flex" : "none", //its kinda
  };

  return (
    <>
      {userIsExitingTheGroup ? <UserExitGroup /> : null}
      {userIsChangingGroupName ? <EditGroupName /> : null}
      {/* Discard Media rendered but didnt implement any logic  */}
      {DiscardMyMedia ? <DiscardMedia /> : null}
      {showLoadingInterface ? <Loading /> : null}
      {showOutgoingCall ? <OutgoingCallModal /> : null}
      {showIncomingCall ? (
        <IncomingCallModal
          callerName={"shapato"}
          onAnswer={audioCallAccepted}
          onDecline={audioCallDeclined}
        />
      ) : null}
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
            {showCreateGroupIntf ? <Create_Group_Interface /> : null}
            {/* {addMoreFriendsInGroup ? <Create_Group_Interface /> : null} */}
          </div>

          <div
            className="main"
            style={chatMainContainerStyle}
            data-testid="chatMainContainer"
          >
            {/* // style={chatMainContainerStyle} */}
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
                {/* <header style={left_side_Header_Style} className="sidebarHeader"> */}
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

                          //we need to be careful about

                          // lastMessage={
                          //   chats.chatId === selectedChat?.chatId &&
                          //   lastMessageInfo?.chatId === chats.chatId
                          //     ? lastMessageInfo
                          //     : "Just Sent Now"
                          // }
                          // lastMessage={
                          //   chats.chatId === selectedChat?.chatId &&
                          //   lastMessageInfo?.chatId === chats.chatId
                          //     ? getFriendlyTimeLabel(lastMessageInfo.timestamp)
                          //     : chats.lastMessage?.timestamp
                          //     ? getFriendlyTimeLabel(
                          //         chats.lastMessage.timestamp
                          //       )
                          //     : null
                          // }
                          // lastMessage={
                          //   chats.chatId === selectedChat?.chatId &&
                          //   lastMessageInfo?.chatId === chats.chatId
                          //     ? lastMessageInfo.message.length > 20
                          //       ? `${lastMessageInfo.message.substring(
                          //           0,
                          //           20
                          //         )}...`
                          //       : lastMessageInfo.message
                          //     : chats.lastMessage?.message
                          //     ? chats.lastMessage.message.length > 20
                          //       ? `${chats.lastMessage.message.substring(
                          //           0,
                          //           20
                          //         )}...`
                          //       : chats.lastMessage.message
                          //     : "Start conversation now"
                          // }
                          // lastMessageSentBy={
                          //   lastMessageInfo?.userName
                          //     ? lastMessageInfo.userName
                          //     : chats?.lastMessage?.userName
                          //     ? chats.lastMessage.userName
                          //     : "Unknown Sender"
                          // }
                          // time={"hello"} //in leftside its the right side wall of the chat box
                          // time={
                          //   lastMessageInfo ? lastMessageInfo.timestamp : null
                          // }
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
