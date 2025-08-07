import React from "react";
import RightSideImage from "../assets/images/rightSideChat.jpg";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";
import "../styles/components/RightSideEmpty.css";
import "../styles/media.css";
import Image from "next/image";
import { auto } from "cloudflare/_shims/registry.mjs";
// import { DotLottieReact } from "@lottiefiles/dotlottie-react"; // causing the console.log freak out

const RightSideEmpty = () => {
  const { isChecked } = useAppStore();
  const { showLoadingInterface } = useChatStore();

  const headersStyle: React.CSSProperties = {
    backgroundColor:
      "linear-gradient(145deg, rgb(244, 244, 244), rgb(232, 232, 232));",
  };

  return (
    <>
      <div
        style={{ display: "flex", flexDirection: "column", width: "100%" }}
        className={
          isChecked ? "right_side_Empty rightSideMobile" : "right_side_Empty"
        }
      >
        <header
          className={
            isChecked
              ? "right_side_Empty_Header rightSideMobile"
              : "right_side_Empty_Header"
          }
          style={headersStyle}
        ></header>
        <div
          className={
            isChecked ? "right_side_Empty rightSideMobile" : "right_side_Empty"
          }
        >
          {!showLoadingInterface ? (
            <main className="right-empty-container">
              <div className="right-empty-inner">
                {/* <DotLottieReact
                  src="https://lottie.host/718acb71-e731-4928-b28d-1d32563e33b7/TpTYZbkQ09.lottie"
                  loop
                  autoplay
                  className="right-empty-lottie"
                /> */}
                <h2>Welcome to SnapText</h2>
                <p>No chat selected.</p>
                <p className="right-empty-subtext">
                  You can start private chats or create unlimited groups from
                  the left panel. Invite users freely and enjoy new features
                  like AI bots and media sharing.
                </p>
              </div>
            </main>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default RightSideEmpty;
