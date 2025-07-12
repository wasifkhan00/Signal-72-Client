import React, { useEffect, useRef } from "react";
// import { themeContext } from "../App";
import "../styles/TypingIndicator.css";
import useChatStore from "@store/ChatStore";

const TypingIndicator = () => {
  //   let { messages, typing } = useContext(themeContext);

  const { messages, typing } = useChatStore();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typing && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [typing]);
  return (
    <>
      <div className="typing-indicator">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
      <div ref={bottomRef}></div>
    </>
  );
};

export default TypingIndicator;
