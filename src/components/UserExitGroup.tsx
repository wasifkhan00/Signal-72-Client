import React from "react";
import axios from "axios";
import Endpoints from "../endpoint/endpoints";
import sockets from "../websockets/websockets";
import { AuthStore } from "@store/AuthStore";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";

const UserExitGroup = () => {
  const { emailAddress } = AuthStore();
  const { dark, setUserIsExitingTheGroup } = useAppStore();
  const { chatId, userIsAdmin } = useChatStore();

  const handleLeaveGroup = () => {
    if (chatId !== "") {
      axios
        .delete(Endpoints.leaveGroupByUser, {
          data: {
            chatId: chatId,
            email: emailAddress,
          },
          headers: Endpoints.getHeaders(),
        })
        .then((response) => {
          if (response.status !== 200) {
            throw Error("Server is busy Please Leave group Some Other Time");
          }
          if (response.data.message === "User left") {
            // sockets.emit("userLeftTheGroup", {
            //   accountNo: response.data.emailAddress,
            //   groupKey: response.data.groupKey,
            // });

            setTimeout(() => {
              window.location.reload;
            }, 50);
          }
        })
        .catch((err) => console.error(err.message));
      setUserIsExitingTheGroup(false);
    }
  };

  const handleDeleteGroup = () => {
    if (chatId !== "") {
      axios
        .delete(Endpoints.deleteGroupByAdmin, {
          data: {
            chatId: chatId,
            isAdmin: userIsAdmin,
          },
          headers: Endpoints.getHeaders(),
        })
        .then((response) => {
          if (response.status !== 200) {
            throw Error(
              "You cannot delete the group at the moment try some other time !"
            );
          }
          if (response.data.success) {
            // window.location.reload(false);
          }
        })
        .catch((err) => console.error(err.message));
    }
  };

  const User_Exit_Group_Container_Styles: React.CSSProperties = {
    background: dark ? "rgb(0 0 0 / 75%)" : "rgb(255 255 255 / 75%)",
    color: dark ? "rgb(193 189 189)" : "black",
    fontSize: "1vw",
    height: "20dvh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
  };

  return (
    <div
      className="Create_Group_Interface_ChatJs_Container leaveGroup"
      style={User_Exit_Group_Container_Styles}
    >
      <div
        style={User_Exit_Group_Container_Styles}
        className="createGroupInterfaceContainer"
      >
        {userIsAdmin
          ? "Are you sure you want to delete the group?"
          : "Are you sure you want to leave the group?"}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            style={{ background: "rgb(71 147 222)" }}
            onClick={userIsAdmin ? handleDeleteGroup : handleLeaveGroup}
          >
            Yes
          </button>
          <button
            style={{ background: "rgb(71 147 222)" }}
            onClick={(e) => setUserIsExitingTheGroup(false)}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserExitGroup;
