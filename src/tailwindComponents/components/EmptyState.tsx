"use client";

import React from "react";
import { Button } from "./ui/button";
import {
  MessageSquare,
  Users,
  Sparkles,
  ArrowRight,
  Zap,
  Globe,
  Menu,
  X,
} from "lucide-react";
import useChatStore from "@store/ChatStore";

interface EmptyStateProps {
  type: "sidebar" | "main";
  onCreateGroup?: () => void;
  onCreateContact?: () => void;
  onOpenMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  onCloseMobile?: () => void;
}

export function EmptyState({
  type,
  onCreateGroup,
  onCreateContact,
  onOpenMobileSidebar,
  isMobileSidebarOpen,
  onCloseMobile,
}: EmptyStateProps) {
  const { setOpenCreateContactModal, setOpenCreateGroupModal } = useChatStore();
  if (type === "sidebar") {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-5 border-b border-white/20 dark:border-slate-700/50">
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Messages
              </h1>
              <p className="text-muted-foreground text-xs text-[#A2ACB9]">
                Start your first conversation
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-xs">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-3 h-3 text-yellow-800" />
              </div>
            </div>

            <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">
              No conversations yet
            </h3>
            <p className="text-[#A2ACB9] text-muted-foreground text-sm mb-6 leading-relaxed text-xs">
              Start connecting with friends and colleagues. Create your first
              chat or group to get started.
            </p>

            <div className="space-y-2">
              <Button
                onClick={() => setOpenCreateContactModal(true)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 rounded-lg h-9 shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2 text-white" />
                <span className="text-white"> New Chat</span>
                <ArrowRight className="w-4 h-4 ml-2 text-white" />
              </Button>

              <Button
                variant="outline"
                onClick={() => setOpenCreateGroupModal(true)}
                className="w-full rounded-lg h-9 border-white/20 dark:border-slate-700/50 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200 text-sm"
              >
                <Users className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center h-full p-8 bg-white"
      // id="rightSideEmpty"
    >
      <Button
        variant="ghost"
        size="icon"
        className="
      absolute top-4 left-4
      h-10 w-10 rounded-xl
      hover:bg-white/50 dark:hover:bg-slate-700/50
      transition-all duration-200
      md:hidden
    "
        onClick={onOpenMobileSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="text-center max-w-lg">
        <div className="relative mb-8">
          {/* Main illustration - smaller for better proportions */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>

            {/* Floating elements - smaller and more subtle */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center animate-float shadow-lg">
              <Zap className="w-4 h-4 text-yellow-800" />
            </div>
            <div
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-xl flex items-center justify-center animate-float shadow-lg"
              style={{ animationDelay: "1s" }}
            >
              <Globe className="w-4 h-4 text-green-800" />
            </div>
            <div className="absolute top-4 -right-6 w-6 h-6 bg-pink-400 rounded-lg flex items-center justify-center animate-bounce shadow-lg">
              <Sparkles className="w-3 h-3 text-pink-800" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Welcome to Signal-72 ✨
        </h2>
        <p className="text-[#A2ACB9] text-muted-foreground text-base mb-6 leading-relaxed">
          Select a conversation from the sidebar to start chatting, or create a
          new one to connect with friends and colleagues.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="text-center p-4 rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium mb-1 text-sm">Private Chats</h4>
            <p className="text-xs text-muted-foreground">
              One-on-one conversations
            </p>
          </div>

          <div className="text-center p-4 rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-medium mb-1 text-sm">Group Chats</h4>
            <p className="text-xs text-muted-foreground">Team conversations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Custom animation keyframes */
<style jsx>{`
  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-8px) rotate(3deg);
    }
  }

  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
`}</style>;
