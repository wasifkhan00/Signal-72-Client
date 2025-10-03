"use client";
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import "../../styles/components/RightSideChat.css";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { AttachmentDropup } from "./ui/AttachmentDropup";

import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Users,
  Image,
  Mic,
  Smile,
  Paperclip,
  Heart,
  ThumbsUp,
  Laugh,
  Settings,
  UserPlus,
  Menu,
} from "lucide-react";
import { Chat, Message } from "./ChatLayout";
import { ScrollArea } from "./ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CallModal } from "./CallModal";
import { toast } from "sonner";
import useChatStore from "@store/ChatStore";
import { AuthStore } from "@store/AuthStore";
import {
  formatChatTimestamp,
  formatRelativeDate,
  formatTimestamp,
} from "../../helpers/ChatTimeStamp";
import useAppStore from "@store/AppStore";
import useChatModulesStore from "@store/ChatModulesStore";
import { AESChatKey } from "../../encryption/GenerateAES";
import { showNotification } from "@components/Notifications";
import sockets from "../../websockets/websockets";
import TypingIndicator from "@utils/TypingIndicator";
import { ImageMessage } from "./ui/ImageMessage";
import { ImagePreviewBeforeSend } from "./ui/ImagePreview";
import { ImagePreviewModal } from "./ui/ImagePreviewModal";
import { decodeKey } from "../../helpers/DecodeEmail";
import { encodeKey } from "../../helpers/EncodeKey";

export function ChatArea({
  onOpenMobileSidebar,
}: {
  onOpenMobileSidebar: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const { emailAddress, name } = AuthStore();
  const messagesArea = useRef<HTMLElement | null>(null);
  const {
    selectedChat,
    messages,
    typing,
    setUserSelectedImage,
    imagePreviewBeforeSending,
  } = useChatStore();
  const { imageUrl } = useChatModulesStore();

  // export function ChatArea({ chat, messages, onSendMessage }: ChatAreaProps) {
  // chat came through props and its equivalent to selectedChat from store in the previous design
  const chat = {
    id: Date.now().toString(),
    type: "group",
    name: "wasif khan",
    participants: 2,
    avatar: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop`,
    lastMessage: "Group created! Start chatting 🎉",
    lastMessageTime: "now",
    status: "online",
    unreadCount: 2,
  };

  const imageUrls = `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop`;
  // const imageUrls = `https://images.unsplash.com/photo-1688600793944-4d45993e6583?q=80&w=1221&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;

  // const message: Message = [
  //   {
  //     id: (Date.now() + 1).toString(),
  //     chatId: "dawdwadwwwad",
  //     senderId: "other",
  //     senderName: "wasif",
  //     content:
  //       'hello! this is a response message from the other user. "Lorem ipsum dolor sit amet, consectetur adipiscing',
  //     timestamp: new Date().toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     }),
  //     isOwn: false,
  //     type: "text",
  //   },
  // ];
  const [newMessage, setNewMessage] = useState("");
  const [BubbleImageClickData, setBubbleImageClickData] = useState({
    openModal: false,
    imageUrl: "",
    alt: "",
    senderName: "",
    timestamp: "",
  });
  // const [isTyping, setIsTyping] = useState(false);

  const [previewBubbleImage, setPreviewBubbleImage] = useState(false);
  const [ImagePreviewBeforeSending, setImagePreviewBeforeSending] =
    useState(false);
  const [showCall, setShowCall] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video">("voice");
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // use requestAnimationFrame to ensure DOM updated
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages]);

  // Simulate incoming call occasionally
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.random() > 0.8 && !showCall) {
        setShowIncomingCall(true);
        setCallType(Math.random() > 0.5 ? "video" : "voice");
        toast.info(`Incoming ${callType} call from ${chat.name}`);
      }
    }, 15000 + Math.random() * 30000); // Random between 15-45 seconds

    return () => clearTimeout(timer);
  }, [chat.name, callType, showCall]);

  // Simulate typing indicator
  useEffect(() => {
    // if (messages.length > 0) {
    //   const timer = setTimeout(() => {
    //     setIsTyping(true);
    //     setTimeout(() => setIsTyping(false), 3000);
    //   }, 5000 + Math.random() * 10000);
    //   return () => clearTimeout(timer);
    // }
  }, [messages]);

  // const handleSend = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (newMessage.trim()) {
  //     onSendMessage(newMessage.trim());
  //     setNewMessage("");
  //   }
  // };

  // const handleImageUpload = () => {
  //   onSendMessage("📸 Shared a beautiful photo", "image");
  //   toast.success("Image sent successfully! 📸");
  // };

  const handleVoiceMessage = () => {
    onSendMessage("🎤 Voice message (0:15)", "voice");
    toast.success("Voice message sent! 🎤");
  };

  const handleVoiceCall = () => {
    setCallType("voice");
    setShowCall(true);
    toast.info(`Starting voice call with ${chat.name}...`);
  };

  const handleVideoCall = () => {
    setCallType("video");
    setShowCall(true);
    toast.info(`Starting video call with ${chat.name}...`);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "text-green-500";
      case "away":
        return "text-yellow-500";
      case "busy":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const reactions = [
    { emoji: "❤️", count: 3 },
    { emoji: "👍", count: 1 },
    { emoji: "😂", count: 2 },
  ];

  // COPIED THIS FROM SEND MESSAGE.tsx FOR INPUT AND SEND MESSAGE
  const { dark, setShowDarkAndLightModeDropDown } = useAppStore();
  const {
    setviewImageContainer,
    setViewImage,
    setShowWait,
    viewImageContainer,

    showWait,
    setImageUrl,
  } = useChatModulesStore();
  // const { emailAddress, name } = AuthStore();
  const {
    setHeIsTyping,
    setTyping,
    setMessages,
    setLastMessageInfo,
    sendImage,
    setSendImage,
    uploadedImageDimensions,
    setUploadedImageDimensions,
    // selectedChat,
    userSelectedImage,
  } = useChatStore();

  const fontColor = dark ? "#ffff" : "#000000";
  const message = useRef<HTMLTextAreaElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const sendMessage = async () => {
    setShowPicker(false);
    setNewMessage("");
    if ((selectedChat && imageUrl) || message?.current?.value?.trim() !== "") {
      const messageString = imageUrl || message?.current?.value;
      // const messageString = userSelectedImage || message?.current?.value;
      console.log(messageString);

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
        timestamp: new Date().toISOString(),
        formattedDateStamp: formatRelativeDate(new Date().toISOString()), // 👈 add here
        formattedTimestamp: formatTimestamp(new Date().toISOString()), // 👈 add here
        containsImage: Boolean(imageUrl),
        imageDimension:
          imageUrl && uploadedImageDimensions
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
      // message!.current!.value! = "";
    }
  };

  const handleMessageInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = e.target.value;

    setNewMessage(text);

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
  // COPIED THIS FROM SEND MESSAGE.tsx FOR INPUT AND SEND MESSAGE

  // useEffect(() => {
  //   const filteredMessagesi = messages.filter(
  //     (msg) => msg.chatId === selectedChat?.chatId
  //   );

  //   // console.log(messages);
  //   // console.log(selectedChat);
  //   console.log(formatChatTimestamp(messages[0].timestamp));

  //   console.error(messages[0]);
  // }, [messages, selectedChat]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesArea.current?.scrollTo({
        top: messagesArea.current.scrollHeight,
        behavior: "smooth",
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [messages]);

  return (
    <div className="flex flex-col h-full right_side" id="right_side">
      {/* Enhanced Chat Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl">
        {/* <div className="flex items-center gap-4"> */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-2 w-1 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200 md:hidden"
            onClick={onOpenMobileSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-white/50 dark:ring-slate-700/50">
              <AvatarImage
                src={selectedChat.avatar}
                alt={selectedChat.chatId}
              />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                {selectedChat.type === "private"
                  ? selectedChat.chatName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : selectedChat.groupNames
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
              </AvatarFallback>
            </Avatar>
            {chat.type === "private" && chat.status && (
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                  chat.status === "online"
                    ? "bg-green-500"
                    : chat.status === "away"
                    ? "bg-yellow-500"
                    : chat.status === "busy"
                    ? "bg-red-500"
                    : "bg-gray-400"
                }`}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
                {/* {chat.name} */}
                {selectedChat.type === "group"
                  ? selectedChat.groupNames
                  : selectedChat.chatName}
              </h2>
              {selectedChat.type === "group" && (
                <Badge
                  variant="secondary"
                  className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-0"
                >
                  <Users className="h-3 w-3 mr-1" />
                  {selectedChat.members?.length || 0} members
                </Badge>
              )}
            </div>
            {selectedChat.type === "private" && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div
                  className={`w-2 h-2 rounded-full ${
                    selectedChat.status === "online"
                      ? "bg-green-500"
                      : selectedChat.status === "away"
                      ? "bg-yellow-500"
                      : selectedChat.status === "busy"
                      ? "bg-red-500"
                      : "bg-gray-400"
                  } animate-pulse`}
                />
                {selectedChat.status === "online"
                  ? "Online"
                  : selectedChat.status === "away"
                  ? "Away"
                  : chat.status === "busy"
                  ? "Busy"
                  : "Last seen recently"}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200"
            onClick={handleVoiceCall}
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200"
            onClick={handleVideoCall}
          >
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 glass-morphism border-white/20"
            >
              {selectedChat.type === "group" && (
                <>
                  <DropdownMenuItem>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Members
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                </>
              )}
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Chat Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* dropdown ENDS HERE HEADER */}

      {/* Enhanced Messages Area */}
      <ScrollArea
        className="h-full w-full overflow-y-auto rounded-md"
        ref={scrollRef}
        onClick={() => {
          setShowPicker(false);
        }}
      >
        <div className="space-y-6 p-2">
          {messages &&
          selectedChat &&
          messages.some((msg) => msg.chatId === selectedChat.chatId) ? (
            messages
              .filter((msg) => msg.chatId === selectedChat.chatId)
              .map((message, index) => {
                console.log(message);
                if (!message.containsImage) {
                  return (
                    <div
                      key={index}
                      className={`flex gap-2 mr-5 mt-2   ${
                        message.email === emailAddress
                          ? "justify-end "
                          : "justify-start"
                      }`}
                    >
                      {message.email !== emailAddress && (
                        <Avatar className="h-10 w-10 mt-1 ring-2 ring-white/50 dark:ring-slate-700/50 flex-shrink-0">
                          <AvatarImage src={message.name} alt={message.name} />
                          <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-sm">
                            {message.email
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`max-w-lg ${
                          message.email !== emailAddress
                            ? "order-1"
                            : "shadow-[0_0_3px_blue] rounded-[17px]"
                        }`}
                      >
                        {message.email !== emailAddress &&
                          chat.type === "group" && (
                            <p className="text-xs font-medium text-muted-foreground mb-2 px-4">
                              {message.name}
                            </p>
                          )}

                        <div className="relative group ">
                          <div
                            className={`relative px-4 py-4 rounded-3xl shadow-sm transition-all duration-200 hover:shadow-md ${
                              message.email !== emailAddress
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white ml-auto max-w-md"
                                : "bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 max-w-md"
                            }`}
                          >
                            <p
                              className="break-words leading-relaxed tracking-[1px]"
                              style={{ wordBreak: "break-word" }}
                            >
                              {message.message}
                            </p>

                            {/* Message reactions */}
                            {index === 1 && message.email !== emailAddress && (
                              <div className="flex gap-1 mt-2 -mb-2">
                                {reactions.map((reaction, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-slate-700/90 rounded-full text-xs"
                                  >
                                    {reaction.emoji} {reaction.count}
                                  </span>
                                ))}
                              </div>
                            )}

                            <span
                              className={`text-xs mt-2 flex justify-between items-center ${
                                message.email !== emailAddress
                                  ? "text-white/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <p className="text-xs">{`${message.formattedDateStamp}  `}</p>

                              <p className="px-4">{` ${message.formattedTimestamp}`}</p>
                            </span>
                          </div>

                          {/* Quick reactions */}
                          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/20">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                              >
                                <Heart className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                              >
                                <Laugh className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div ref={bottomRef} />
                    </div>
                  );
                } else {
                  return (
                    <>
                      <div
                        key={index}
                        className={`flex mr-5 mt-2   ${
                          message.email === emailAddress
                            ? "justify-end "
                            : "justify-start ml-10"
                        }`}
                      >
                        <div className={`flex max-w-[65%] min-w-[40%] w-[50%]`}>
                          <ImageMessage
                            timeStamp={message.formattedTimestamp}
                            dateStamp={message.formattedDateStamp}
                            // caption="halak naree chinar"
                            imageUrl={message.message}
                            onImageClick={() => {
                              setBubbleImageClickData({
                                openModal: true,
                                imageUrl: message.message,
                                alt: `Image ${message.formattedDateStamp}`,
                                senderName: message.name,
                                timestamp: message.formattedTimestamp,
                              });
                              setPreviewBubbleImage(true);
                            }}
                          />
                        </div>
                        <div ref={bottomRef} />
                      </div>
                    </>
                  );
                }
              })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                {chat.type === "group" ? (
                  <Users className="h-10 w-10 text-white" />
                ) : (
                  <Avatar className="h-16 w-16 ring-4 ring-white/50">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500   to-purple-600 text-white font-medium text-lg">
                      {selectedChat.type === "private"
                        ? selectedChat.chatName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : selectedChat.groupNames
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                {selectedChat.type === "group"
                  ? `Welcome to ${selectedChat.groupNames}! 🎉`
                  : `Start chatting with ${selectedChat.chatName} ✨`}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {selectedChat.type === "group"
                  ? "This is the beginning of your group conversation. Say hello to everyone!"
                  : "This is the beginning of your conversation. Send a message to break the ice!"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Typing Indicator */}
      {typing && <TypingIndicator />}

      {/* Enhanced Message Input */}
      <div className="p-2 h-20 border-t border-white/20 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl">
        <div className="flex items-end gap-3">
          <div className="flex gap-2">
            {/* *********************************************************************************************************************** */}
            <div className="relative">
              {/* Emoji button */}
              <button
                type="button"
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => setShowPicker(!showPicker)}
              >
                😀
              </button>

              {showPicker && (
                <div className="absolute bottom-12 left-0 z-50">
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji: any) => {
                      setNewMessage(emoji.native);
                      if (message.current) {
                        message.current.value += emoji.native;
                      }
                    }}
                    previewPosition="none"
                    skinTonePosition="search"
                    theme="light"
                    style={{ width: "300px" }}
                  />
                </div>
              )}
            </div>
            {/* *********************************************************************************************************************** */}
            <span className="flex gap-2 " onClick={() => setShowPicker(false)}>
              <AttachmentDropup />
            </span>
          </div>

          <div className="flex-1 relative">
            <Input
              disabled={viewImageContainer ? true : false}
              onKeyDown={handleSendMessageOnEnter}
              onChange={handleMessageInputChange}
              onClick={() => setShowPicker(false)}
              style={message_Input_Style}
              ref={message}
              id="comment"
              name="e"
              cols={150}
              rows={2}
              autoFocus={true}
              placeholder="Type your message here..."
              className="h-12 pr-10 rounded-[1.5rem] bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all duration-200"
            />
            {/* <Button
              type="button"
              onClick={sendMessage}
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200"
            >
              <Send className="h-4 w-4" />
            </Button> */}
          </div>

          <div className="flex gap-2">
            {newMessage.trim() ? (
              <Button
                type="button"
                onClick={sendMessage}
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                onClick={handleVoiceMessage}
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
      {userSelectedImage && imagePreviewBeforeSending ? (
        <ImagePreviewBeforeSend imageUrl={userSelectedImage} />
      ) : null}
      {/* {imageUrl ? (
        <ImagePreviewBeforeSend open={true} imageUrl={imageUrl} />
      ) : null} */}

      <ImagePreviewModal
        open={previewBubbleImage}
        // open={BubbleImageClickData.openModal}
        onOpenChange={setPreviewBubbleImage}
        imageUrl={BubbleImageClickData.imageUrl}
        alt={BubbleImageClickData.alt}
        senderName={BubbleImageClickData.senderName}
        timestamp={BubbleImageClickData.timestamp}
      />

      {/* Call Modals */}
      {/* <CallModal
        open={showCall}
        onOpenChange={setShowCall}
        // chat={chat}
        callType={callType}
      />

      <CallModal
        open={showIncomingCall}
        onOpenChange={setShowIncomingCall}
        // chat={chat}
        callType={callType}
        isIncoming={true}
      /> */}
    </div>
  );
}
