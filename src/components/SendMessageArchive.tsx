import React, { useState, useRef, useEffect } from "react";
import { IoMdPhotos, IoMdSend } from "react-icons/io";
import imageCompression from "browser-image-compression";
import sockets from "../websockets/websockets";
import useAppStore from "@store/AppStore";
import { AuthStore } from "@store/AuthStore";
import useChatStore from "@store/ChatStore";
import useChatModulesStore from "@store/ChatModulesStore";
import "../styles/components/SendMessage.css";
import "../styles/media.css";
import { AESChatKey } from "../encryption/GenerateAES";
import { showNotification } from "./Notifications";

const SendMessage = () => {
  const { dark, setShowDarkAndLightModeDropDown } = useAppStore();
  const {
    setviewImageContainer,
    setViewImage,
    setShowWait,
    viewImageContainer,

    showWait,
    setImageUrl,
  } = useChatModulesStore();
  const { emailAddress, name } = AuthStore();
  const {
    setHeIsTyping,
    setTyping,
    setMessages,
    setLastMessageInfo,
    sendImage,
    setSendImage,
    uploadedImageDimensions,
    setUploadedImageDimensions,
    selectedChat,
  } = useChatStore();

  const fontColor = dark ? "#ffff" : "#000000";
  const message = useRef<HTMLTextAreaElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [userSelectedImage, setUserSelectedImage] = useState("");

  useEffect(() => {
    const handleMessageReceived = async (messagePayload: any) => {
      let decryptedMessagePayload = messagePayload;

      try {
        const { ciphertextBase64, ivBase64 } = messagePayload.message;
        const decrypted = await AESChatKey.decryptMessage(
          messagePayload.chatId,
          ciphertextBase64,
          ivBase64
        );

        decryptedMessagePayload = {
          ...messagePayload,
          message: decrypted,
        };
      } catch (error) {
        console.error("Decryption failed:", error);
      }
      console.log("message received triggered");
      console.log(decryptedMessagePayload.name);
      // if (!document.hasFocus()) {
      showNotification(
        `New Message", "One new message received from ${decryptedMessagePayload.name}`
      );
      // } else {
      console.log("document is fucked focused");
      // }

      setMessages((prevState) => [...prevState, decryptedMessagePayload]);
    };

    const handleUserTyping = (userTypingData: any) => {
      setTyping(true);
      setHeIsTyping(userTypingData.typingAccount);
    };

    const handleUserStoppedTyping = () => {
      setTyping(false);
      setHeIsTyping("");
    };

    const handleUpdateLastMessage = (lastMessagePayload: any) => {
      // setLastMessageInfo(lastMessagePayload);
    };
    // const newChat = (chatPayload: any) => {
    //   console.log(chatPayload);
    //   console.log("New chat Payload Has successullt being initiated");
    // };

    sockets.on("message:received", handleMessageReceived);
    sockets.on("userIsTyping", handleUserTyping);
    sockets.on("userHasStoppedTyping", handleUserStoppedTyping);
    sockets.on("updateLastMessage", handleUpdateLastMessage);
    // sockets.on("newChatInitiated", newChat);

    return () => {
      sockets.off("message:received", handleMessageReceived);
      sockets.off("userIsTyping", handleUserTyping);
      sockets.off("userHasStoppedTyping", handleUserStoppedTyping);
      sockets.off("updateLastMessage", handleUpdateLastMessage);
      // sockets.off("newChatInitiated", newChat);
    };
  }, [sockets]);

  const handleImageSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setviewImageContainer(true);
    setShowWait(true);
    setViewImage(false);

    const fileData = e.target.files?.[0];
    if (!fileData) return;

    const maxSizeInBytes = 1 * 1024 * 1024;
    if (fileData.size > maxSizeInBytes) {
      alert("❌ Image too large. Max 1MB allowed.");
      setShowWait(false);
      setviewImageContainer(false);
      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(fileData, options);

      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);

      reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
        const result = readerEvent.target?.result;
        if (!result || typeof result !== "string") return;

        const img = new Image();

        img.onload = () => {
          setUploadedImageDimensions({
            width: img.width,
            height: img.height,
          });
        };

        img.src = result;

        setImageUrl(result);
        setUserSelectedImage(result);
        setShowWait(false);
      };
    } catch (error: any) {
      console.error(error?.message || "Image compression error");
      setShowWait(false);
    }
  };

  const sendMessage = async () => {
    console.log(selectedChat);

    if (
      selectedChat &&
      (userSelectedImage || message?.current?.value?.trim() !== "")
    ) {
      const messageString = userSelectedImage || message?.current?.value;

      const userMessage = await AESChatKey.encryptMessage(
        selectedChat.chatId,
        messageString
      );

      // console.log(selectedChat);

      const localMessagePayload = {
        name,
        email: emailAddress,
        to:
          selectedChat.type === "private"
            ? selectedChat?.chatInitiatedTo.email
            : null,
        chatName:
          selectedChat.type === "group" ? selectedChat?.groupNames : null,
        message: messageString,
        type: selectedChat?.type,
        chatId: selectedChat?.chatId,
        timestamp: new Date(),
        containsImage: Boolean(userSelectedImage),
        imageDimension:
          userSelectedImage && uploadedImageDimensions
            ? uploadedImageDimensions
            : { width: 0, height: 0 },
      };

      const messagePayload = {
        ...localMessagePayload,
        message: userMessage,
      };

      if (!sockets.connected) sockets.connect();

      if (selectedChat?.type === "private") {
        console.log(selectedChat);
        sockets.emit("message:send", messagePayload, selectedChat);
      } else {
        sockets.emit("message:send", messagePayload);
      }

      setMessages((prev) => [...prev, localMessagePayload]);

      sockets.emit("userStoppedTyping", {
        typingAccount: emailAddress,
        chatId: selectedChat?.chatId,
      });

      setTyping(false);
      message!.current!.value = "";
      setUserSelectedImage("");
      setSendImage(false);
    } else {
      console.error(
        "Your Request Could not be Proceed at the moment please try again later"
      );
    }
  };

  const handleSendMessageOnEnter = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
      message!.current!.value! = "";
    }
  };

  const handleMessageInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = e.target.value;

    sockets.emit("userTyping", {
      typingAccount: emailAddress,
      chatId: selectedChat?.chatId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sockets.emit("userStoppedTyping", {
        typingAccount: emailAddress,
        chatId: selectedChat?.chatId,
      });
    }, 3000);
  };

  useEffect(() => {
    if (sendImage) {
      sendMessage();
    }
  }, [sendImage]);

  const message_Input_Style: React.CSSProperties = {
    color: fontColor,
    boxShadow: dark
      ? "0px 3px 1px rgb(76 76 76)"
      : "0px 3px 1px rgb(202, 201, 201)",
  };

  const send_Icon_Style: React.CSSProperties = {
    color: fontColor,
    cursor: viewImageContainer ? "auto" : "pointer",
    outline: "none",
    border: "none",
  };

  return (
    <div
      onClick={(e) => setShowDarkAndLightModeDropDown(false)}
      className="send_Message_Input"
    >
      <div className="attachments_emojis">
        <label htmlFor="media">
          <span style={{ color: fontColor }}>
            <IoMdPhotos />
          </span>
        </label>
        <input
          onChange={handleImageSubmit}
          type="file"
          id="media"
          name="media"
          accept="image/*"
          style={{ display: "none" }}
        />
      </div>

      <textarea
        disabled={viewImageContainer ? true : false}
        onKeyDown={handleSendMessageOnEnter}
        onChange={handleMessageInputChange}
        style={message_Input_Style}
        ref={message}
        id="comment"
        name="e"
        cols={150}
        rows={2}
        autoFocus={true}
        placeholder="Type your message here..."
      ></textarea>

      <button
        disabled={viewImageContainer ? true : false}
        className="sendIcon"
        style={send_Icon_Style}
      >
        <IoMdSend onClick={sendMessage} />
      </button>
    </div>
  );
};

export default SendMessage;
