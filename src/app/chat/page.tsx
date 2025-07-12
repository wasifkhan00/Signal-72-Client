"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Chat from "@components/Chat";
import { AuthStore } from "@store/AuthStore";

const ChatPage = () => {
  const router = useRouter();
  const { showChat } = AuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // local state to wait

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !showChat) {
      router.replace("/login");
    } else {
      setIsCheckingAuth(false); // show chat only if valid
    }
  }, [showChat]);

  if (isCheckingAuth) return null; // or show a spinner/loader

  return <Chat />;
};

export default ChatPage;
