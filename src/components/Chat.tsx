import React, { useEffect, useRef, useState } from "react";
import Create_Group_Interface from "./CreateGroupInterface";
import DiscardMedia from "../utils/DiscardMedia";
import sockets from "../websockets/websockets";
// import RightSideEmpty from "./RightSideEmpty";
import Endpoints from "../endpoint/endpoints";
import { AuthStore } from "@store/AuthStore";
// import RightSideChat from "./RightSideChat";
// import LeftSideEmpty from "./LeftSideEmpty";
import UserExitGroup from "./UserExitGroupArchive";
import EditGroupName from "./EditGroupNameArchive";
// import PopupMenu from "../utils/EditPopup";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";
// import Loading from "../utils/Loading";
// import "../styles/chatInterface.css";
// import "../styles/components/CreateGroupInterface.css";
// import "../styles/media.css";
import "../styles/components/Chat.css";
import axios from "axios";
// import User from "./User";
// import Login from "./LoginArchive";
import { fetchMessages } from "./FetchMessages";
import useChatModulesStore from "@store/ChatModulesStore";
import { AESChatKey } from "../encryption/GenerateAES";
import { decryptRSAKeyFromSessionKey } from "../encryption/DecryptRSASessionKey";
import { removeDraftChat } from "../helpers/DraftChats";
import { decodeEmail } from "../helpers/DecodeEmail";
import fetchDraftChats from "../helpers/FetchDrafts";
import { handleTabFocus } from "../helpers/ScreenVisibility";
import { requestNotificationPermission } from "./Notifications";
import { chatMainContainerStyle } from "@styles/components/Chat";
import { getMicrophoneAccess } from "../helpers/MicrophonePermission";
import { playMicAudio } from "../Testing/AudioTesting";
import IncomingCallModal from "./CallRinging";
import OutgoingCallModal from "./OutgoingCall";
// import { CreateContactModal } from "../tailwindComponents/components/CreateContactModal";
import { EmptyState } from "../tailwindComponents/components/EmptyState";
import { CreateGroupModal } from "../tailwindComponents/components/CreateGroupModal";
import { ChatSidebar } from "../tailwindComponents/components/ChatSidebar";
import { ChatArea } from "../tailwindComponents/components/ChatArea";
import { ChatLoadingState } from "../tailwindComponents/components/ui/ChatLoadingState";

const Chat = () => {
  const { emailAddress, setRSAKeyPairs } = AuthStore();
  const [ringingUserData, setRingingUserData] = useState<any>(null);
  const didRunRef = useRef(false);
  const {
    userIsChangingGroupName,
    // showRightSideMobile,
    setShowRightSideMobile,
    // isChecked,
    loggOut,
    userIsExitingTheGroup,
    // dark,
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
    showOutgoingCall,
    setShowOutgoingCall,
    openCreateGroupModal,
    setMessages,
  } = useChatStore();

  const { viewImageContainer } = useChatModulesStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); //copied from figma make for respin

  const fetchedChatIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const drafts = fetchDraftChats(); // already an array

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

      AESChatKey.storeKeyLocally(
        newchat.chatId,
        decodedAESKeyMap[emailAddress]
      );

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
      // console.log(callPayload);
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

    sockets.on("deletePrivateChatDraft", removeDraftChat);
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

          // console.log(response.data.response);

          const updatedChats = response.data.response.map((chats: any) => {
            // console.log(chats);
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

              AESChatKey.storeKeyLocally(
                chats.chatId,
                decodedAESKeyMap[emailAddress]
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
    setIsMobileSidebarOpen(false);

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

  const onOpenMobileSidebar = () => {
    // alert("clicked");
    setIsMobileSidebarOpen(true);
  };

  const onCloseMobile = () => {
    setIsMobileSidebarOpen(false);
  };
  return (
    <>
      {/* <CreateContactModal /> */}

      {openCreateGroupModal ? <Create_Group_Interface /> : null}
      {userIsExitingTheGroup ? <UserExitGroup /> : null}
      {userIsChangingGroupName ? <EditGroupName /> : null}
      {openCreateGroupModal ? <CreateGroupModal /> : null}
      {/* Discard Media rendered but didnt implement any logic  */}
      {DiscardMyMedia ? <DiscardMedia /> : null}
      {/* usually the below is responsible for loading */}
      {/* {showLoadingInterface ? <Loading /> : null} */}
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
            <Create_Group_Interface />
          </div>

          <div
            className="main"
            style={chatMainContainerStyle}
            data-testid="chatMainContainer"
          >
            <div
              className={`
      ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0
      fixed md:relative
      // w-full sm:w-[360px] md:w-[370px]
      top-0 left-0
      z-50 md:z-auto
      h-full
      border-r border-black/20 dark:border-slate-700/50
      bg-white/95 dark:bg-slate-800/95 md:bg-white/70 md:dark:bg-slate-800/70
      backdrop-blur-xl
      flex flex-col
      transition-transform duration-300 ease-in-out
    `}
            >
              <div>
                {chatList && chatList.length > 0 ? (
                  // the chat sidebar with actual chat list
                  <ChatSidebar
                    wholeElementClicked={wholeElementClicked}
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    onCloseMobile={onCloseMobile}
                  />
                ) : (
                  // <LeftSideEmpty />
                  <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 overflow-hidden">
                    <div className=" border-r">
                      {/* // the chat sidebar with no chat list */}

                      <EmptyState
                        type="sidebar"
                        isMobileSidebarOpen={isMobileSidebarOpen}
                        onCloseMobile={onCloseMobile}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`
      flex-1
      h-full
            w-full sm:w-[360px] md:w-[1000px]

      ml-0 md:ml-[0px]
      flex flex-col
      transition-all duration-300 ease-in-out
      bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100
      dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900
      overflow-hidden
    `}
            >
              {selectedChat ? (
                <>
                  {/* <RightSideChat /> */}
                  {showLoadingInterface ? (
                    <div className="w-full flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50/50 via-white/30 to-blue-50/50 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-indigo-900/50">
                      {/* the loading for fetching messages */}
                      <ChatLoadingState />
                    </div>
                  ) : (
                    <div className="flex h-screen   bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 overflow-hidden">
                      <ChatArea onOpenMobileSidebar={onOpenMobileSidebar} />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-screen   bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 overflow-hidden">
                  {/* <div className="flex w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 overflow-hidden"> */}
                  <div className="flex-1">
                    <EmptyState
                      type="main"
                      onOpenMobileSidebar={onOpenMobileSidebar}
                    />
                  </div>
                </div>
                // <RightSideEmpty />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default Chat;
