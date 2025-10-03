"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Plus,
  Users,
  MessageSquare,
  Search,
  MoreVertical,
  Edit,
  Sparkles,
  X,
} from "lucide-react";
import { Chat } from "./ChatLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import useChatStore from "@store/ChatStore";

interface ChatSidebarProps {
  wholeElementClicked?: () => any;
  onCloseMobile?: () => void;
  isMobileSidebarOpen: boolean;
}

export function ChatSidebar({
  wholeElementClicked,
  onCloseMobile,
  isMobileSidebarOpen,
}: ChatSidebarProps) {
  const {
    selectedChat,
    setOpenCreateContactModal,
    setOpenCreateGroupModal,
    chatList,
    userOnlineStatus,
  } = useChatStore();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <>
      {/* Enhanced Header */}
      <div className="p-6 border-b border-white/20 dark:border-slate-700/50 ">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isMobileSidebarOpen && onCloseMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200 md:hidden"
                onClick={onCloseMobile}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-l font-semibold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-black">
                Signal-72
              </h1>
              <p className="text-xs text-muted-foreground">
                {chatList.length} conversations
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200 "
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 glass-morphism border-white/20 dark:border-slate-700/50 bg-white"
            >
              <DropdownMenuItem
                onClick={() => setOpenCreateContactModal(true)}
                className="flex items-center gap-3 py-3 hover:bg-white/50 dark:hover:bg-slate-500 transition-all duration-200 cursor-pointer hover:bg-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">New Chat</p>
                  <p className="text-xs text-muted-foreground">
                    Start a private conversation
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                // onClick={onCreateGroup}
                onClick={() => setOpenCreateGroupModal(true)}
                className="flex items-center gap-3 py-3 hover:bg-white/50 dark:hover:bg-slate-500 transition-all duration-200  cursor-pointer hover:bg-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">New Group</p>
                  <p className="text-xs text-muted-foreground">
                    Create a group chat
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Modern Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground text-sm" />
          <Input
            placeholder="Search conversations..."
            // disabled={true}
            // value={searchQuery}
            // onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 rounded-xl bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200"
          />
        </div>
      </div>

      {/* Modern Chat List */}
      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="p-3 space-y-2">
          {chatList.map((chat, index) => {
            return (
              <div
                key={chat.chatId}
                data-chat-id={chat.chatId}
                onClick={wholeElementClicked}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-white/60 dark:hover:bg-slate-700/40 hover:shadow-lg hover:scale-[1.02] ${
                  selectedChat?.chatId === chat.chatId
                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20 shadow-md border border-indigo-200 dark:border-indigo-700/50"
                    : "hover:shadow-sm"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-2 ring-white/50 dark:ring-slate-700/50">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                      {chat.type === "private"
                        ? chat.chatName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : chat.groupNames
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {chat.type === "private" && (
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${getStatusColor(
                        "online"
                      )}`}
                    />
                  )}
                  {chat.type === "group" && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                      <Users className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h6 className="font-medium truncate text-slate-900 dark:text-black text-[13px]">
                      {chat.type === "private"
                        ? chat.chatName
                        : chat.groupNames}
                    </h6>
                    <div className="flex items-center gap-2">
                      {/* {chat.lastMessageTime && ( */}
                      {chat && (
                        <span className="text-[9px] text-muted-foreground font-medium">
                          9:00 PM
                        </span>
                      )}
                      {chat.type === "group" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/50 dark:hover:bg-slate-600/50"
                              // onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="glass-morphism border-white/20 bg-white"
                          >
                            <DropdownMenuItem
                            // onClick={(e) => {
                            //   e.stopPropagation();
                            //   onEditGroup(chat);
                            // }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Group Name
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                      {/* {chat.lastMessage.message} */}
                      {"Start Conversation"}
                      {/* {chat.lastMessage || "No messages yet"} */}
                    </p>
                    {chat && (
                      // {chat.unreadCount && chat.unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-4 min-w-1 text-[10px] rounded-xl bg-gradient-to-r from-red-500 to-pink-500 border-0 shadow-md animate-pulse"
                      >
                        10+
                        {/* {chat.unreadCount > 9 ? "9+" : chat.unreadCount} */}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
}
