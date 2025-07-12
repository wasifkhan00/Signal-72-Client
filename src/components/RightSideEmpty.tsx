import React from "react";
import RightSideImage from "../assets/images/rightSideChat.jpg";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";
import Image from "next/image";
import { auto } from "cloudflare/_shims/registry.mjs";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const RightSideEmpty = () => {
  const { isChecked } = useAppStore();
  const { showLoadingInterface } = useChatStore();

  const headersStyle: React.CSSProperties = {
    backgroundColor:
      "linear-gradient(145deg, rgb(244, 244, 244), rgb(232, 232, 232));",
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
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
            <main>
              <div className="imgContainerEmpty">
                <DotLottieReact
                  src="https://lottie.host/718acb71-e731-4928-b28d-1d32563e33b7/TpTYZbkQ09.lottie"
                  loop
                  autoplay
                />
                {/* <Image src={RightSideImage} alt="" width={300} /> */}
              </div>
              <span>
                You can create only one group at a time , If someone adds you in
                the group and you already have a group created, You'll not be
                added unless you delete your own group and see this page. You
                can leave the group later. If you're the admin and you deleted
                your group every message you did in the group and every member's
                messages will be deleted permanently.
                {/* You can now create and join
              multiple groups freely. No need to delete existing groups to be
              added to new ones. As an admin, you can add members, manage
              settings, and even include AI chatbots. If a group is deleted, all
              its messages will be permanently removed. New Features are
              incoming */}
              </span>
            </main>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default RightSideEmpty;
