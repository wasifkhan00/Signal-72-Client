import React, { useState } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatArea } from "./ChatArea";
import { EmptyState } from "./EmptyState";
import { CreateGroupModal } from "./CreateGroupModal";
import { CreateContactModal } from "./CreateContactModal";
import { EditGroupModal } from "./EditGroupModal";
import { toast } from "sonner";

export interface Chat {
  id: string;
  type: "private" | "group";
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
  participants?: string[];
  status?: "online" | "away" | "busy" | "offline";
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  type?: "text" | "image" | "voice" | "file";
  reactions?: { emoji: string; users: string[] }[];
}

// Enhanced sample data with more modern structure
const sampleChats: Chat[] = [
  {
    id: "1",
    type: "private",
    name: "Sarah Chen",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    lastMessage: "That new design looks incredible! 🎨",
    lastMessageTime: "2m",
    unreadCount: 2,
    isOnline: true,
    status: "online",
  },
  {
    id: "2",
    type: "group",
    name: "Design Squad",
    avatar:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop",
    lastMessage: "Alex: The prototype is ready for review",
    lastMessageTime: "15m",
    unreadCount: 0,
    participants: ["Alex Rivera", "Maria Santos", "David Kim", "Emma Wilson"],
  },
  {
    id: "3",
    type: "private",
    name: "Mike Rodriguez",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    lastMessage: "Perfect! Let's ship it 🚀",
    lastMessageTime: "1h",
    unreadCount: 0,
    isOnline: false,
    status: "away",
  },
  {
    id: "4",
    type: "group",
    name: "Weekend Vibes",
    avatar:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop",
    lastMessage: "Lisa: Hiking at sunrise tomorrow? 🌅",
    lastMessageTime: "3h",
    unreadCount: 1,
    participants: ["Lisa Park", "Tom Anderson", "Rachel Green", "Chris Lee"],
  },
  {
    id: "5",
    type: "private",
    name: "Jessica Taylor",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    lastMessage: "Can't wait for our meeting! ✨",
    lastMessageTime: "1d",
    unreadCount: 0,
    isOnline: true,
    status: "busy",
  },
];

const sampleMessages: Message[] = [
  {
    id: "1",
    chatId: "1",
    senderId: "sarah",
    senderName: "Sarah Chen",
    content:
      "Hey! How was your weekend? I tried that new coffee place you recommended ☕",
    timestamp: "2:34 PM",
    isOwn: false,
  },
  {
    id: "2",
    chatId: "1",
    senderId: "sarah",
    senderName: "Sarah Chen",
    content:
      "The ambiance was incredible, and the matcha latte was perfect! 🍵✨",
    timestamp: "2:35 PM",
    isOwn: false,
  },
  {
    id: "3",
    chatId: "1",
    senderId: "user",
    senderName: "You",
    content: "I'm so glad you liked it! Did you try their pastries too?",
    timestamp: "2:36 PM",
    isOwn: true,
  },
  {
    id: "4",
    chatId: "2",
    senderId: "alex",
    senderName: "Alex Rivera",
    content: "The new prototype is ready! Check out the smooth animations 🎭",
    timestamp: "1:20 PM",
    isOwn: false,
  },
  {
    id: "5",
    chatId: "2",
    senderId: "user",
    senderName: "You",
    content: "Wow! The micro-interactions are so polished. Great work team! 🙌",
    timestamp: "1:22 PM",
    isOwn: true,
  },
  {
    id: "6",
    chatId: "2",
    senderId: "maria",
    senderName: "Maria Santos",
    content:
      "The color transitions are buttery smooth. Users will love this! 🎨",
    timestamp: "1:25 PM",
    isOwn: false,
  },
];

export function ChatLayout() {
  const [chats, setChats] = useState<Chat[]>(sampleChats);
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [activeChat, setActiveChat] = useState<Chat | null>(sampleChats[0]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateContact, setShowCreateContact] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Chat | null>(null);

  const hasChats = chats.length > 0;

  const handleCreateGroup = (name: string, participants: string[]) => {
    const newGroup: Chat = {
      id: Date.now().toString(),
      type: "group",
      name,
      participants,
      avatar: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop`,
      lastMessage: "Group created! Start chatting 🎉",
      lastMessageTime: "now",
      unreadCount: 0,
    };
    setChats((prev) => [newGroup, ...prev]);
    setActiveChat(newGroup);
    setShowCreateGroup(false);
    toast.success(`"${name}" group created successfully! 🎉`);
  };

  const handleCreateContact = (name: string, phone: string) => {
    const newContact: Chat = {
      id: Date.now().toString(),
      type: "private",
      name,
      avatar: `https://images.unsplash.com/photo-${
        Math.floor(Math.random() * 1000) + 1500000000000
      }-${Math.floor(Math.random() * 100000)}?w=400&h=400&fit=crop&crop=face`,
      isOnline: Math.random() > 0.5,
      status: Math.random() > 0.5 ? "online" : "offline",
      lastMessage: "Say hello! 👋",
      lastMessageTime: "now",
      unreadCount: 0,
    };
    setChats((prev) => [newContact, ...prev]);
    setActiveChat(newContact);
    setShowCreateContact(false);
    toast.success(`${name} added to contacts! 👋`);
  };

  const handleEditGroup = (groupId: string, newName: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === groupId ? { ...chat, name: newName } : chat
      )
    );
    if (activeChat?.id === groupId) {
      setActiveChat((prev) => (prev ? { ...prev, name: newName } : null));
    }
    setShowEditGroup(false);
    setEditingGroup(null);
    toast.success("Group name updated! ✨");
  };

  const handleSendMessage = (
    content: string,
    type: "text" | "image" | "voice" = "text"
  ) => {
    if (!activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: activeChat.id,
      senderId: "user",
      senderName: "You",
      content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
      type,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Update last message in chat
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id
          ? { ...chat, lastMessage: content, lastMessageTime: "now" }
          : chat
      )
    );

    // Simulate smart responses with emojis
    setTimeout(() => {
      const responses = [
        "That sounds amazing! ✨",
        "I totally agree with you 💯",
        "Thanks for sharing that! 🙏",
        "Super interesting perspective 🤔",
        "Let me think about that 💭",
        "Absolutely love this idea! 🚀",
        "I see what you mean 👀",
        "Brilliant thinking! 🧠",
        "That makes perfect sense 💡",
        "I'll dive into that right away! 🏊‍♂️",
      ];

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        chatId: activeChat.id,
        senderId: "other",
        senderName: activeChat.name,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: false,
        type: "text",
      };

      setMessages((prev) => [...prev, responseMessage]);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                lastMessage: responseMessage.content,
                lastMessageTime: "now",
              }
            : chat
        )
      );
    }, 1000 + Math.random() * 2000);
  };

  const chatMessages = messages.filter((msg) => msg.chatId === activeChat?.id);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Modern glass container */}
      <div className="flex w-full max-w-7xl mx-auto my-4 rounded-3xl overflow-hidden shadow-modern glass-morphism">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-white/20 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl flex flex-col">
          {hasChats ? (
            <ChatSidebar
              chats={chats}
              activeChat={activeChat}
              onChatSelect={setActiveChat}
              onCreateGroup={() => setShowCreateGroup(true)}
              onCreateContact={() => setShowCreateContact(true)}
              onEditGroup={(chat) => {
                setEditingGroup(chat);
                setShowEditGroup(true);
              }}
            />
          ) : (
            <EmptyState
              type="sidebar"
              onCreateGroup={() => setShowCreateGroup(true)}
              onCreateContact={() => setShowCreateContact(true)}
            />
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl">
          {activeChat ? (
            <ChatArea
              chat={activeChat}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <EmptyState type="main" />
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        onCreateGroup={handleCreateGroup}
      />

      <CreateContactModal
        open={showCreateContact}
        onOpenChange={setShowCreateContact}
        onCreateContact={handleCreateContact}
      />

      {editingGroup && (
        <EditGroupModal
          open={showEditGroup}
          onOpenChange={setShowEditGroup}
          group={editingGroup}
          onEditGroup={handleEditGroup}
        />
      )}
    </div>
  );
}
