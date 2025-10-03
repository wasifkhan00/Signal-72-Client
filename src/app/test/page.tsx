"use client";
import OtpAuthentication from "@components/Otp";
import { useEffect, useState } from "react";
import { EmptyState } from "../../tailwindComponents/components/EmptyState";
import LeftSideEmpty from "@components/LeftSideEmpty";
import RightSideEmpty from "@components/RightSideEmpty";
import { CreateContactModal } from "../../tailwindComponents/components/CreateContactModal";
import { CreateGroupModal } from "../../tailwindComponents/components/CreateGroupModal";
import Create_Group_Interface from "@components/CreateGroupInterface";
import { ChatLayout } from "../../tailwindComponents/components/ChatLayout";
import { ChatArea } from "../../tailwindComponents/components/ChatArea";
import { ChatSidebar } from "../../tailwindComponents/components/ChatSidebar";
import useChatModulesStore from "@store/ChatModulesStore";
import { ChatLoadingState } from "../../tailwindComponents/components/ui/ChatLoadingState";
import { AESChatKey } from "../../encryption/GenerateAES";
import Login from "../../tailwindComponents/";

export default function Test() {
  const { imageUrl } = useChatModulesStore();

  return (
    <>
      <ChatLoadingState />
    </>
  );
}
