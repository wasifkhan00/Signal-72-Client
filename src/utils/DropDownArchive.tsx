import React from "react";
import "../styles/dropdown.css";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";
import { useRouter } from "next/navigation";
import { AuthStore } from "@store/AuthStore";
import { useLoginStore } from "@store/LoginStore";
import { useRegisterStore } from "@store/RegisterStore";

const Dropdown = () => {
  const router = useRouter();
  const { emailAddress, setEmailAddress, setName, setToken, setShowChat } =
    AuthStore();
  const {
    incorrectEmailOrPassword,
    usersName,
    showWaitForApiResponse,
    email,
    password,
    setIncorrectEmailOrPassword,
    setUsersName,
    setShowWaitForApiResponse,
    setEmail,
    setPassword,
  } = useLoginStore();
  const { setField } = useRegisterStore();
  const {
    dark,
    setDark,
    setUserIsExitingTheGroup,
    setUserIsChangingGroupName,
    setShowRightSideMobile,
    showRightSideMobile,
    setShowDarkAndLightModeDropDown,
  } = useAppStore();

  const { userIsAdmin, selectedChat } = useChatStore();

  const drop_Down_Container_Style: React.CSSProperties = {
    backgroundColor: dark ? "rgb(59, 59, 59)" : "rgb(246, 246, 246)",
  };

  const fontColor: React.CSSProperties = {
    color: dark ? "white" : "black",
  };
  const handleDarkButton = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dark) return;
    setShowDarkAndLightModeDropDown(false);
    setDark(true);
  };

  const handleLightButton = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dark) return;
    setShowDarkAndLightModeDropDown(false);
    setDark(false);
  };

  //
  const handleLoggout = (e: React.MouseEvent<HTMLDivElement>) => {
    setShowDarkAndLightModeDropDown(false);

    localStorage.removeItem("token");
    localStorage.removeItem("names");
    localStorage.removeItem("emails");
    localStorage.removeItem("unverifiedEmail");

    setEmailAddress("");
    setName("");
    setToken("");
    setShowChat(false);
    setField("successMessage", false);
    setEmail("");
    setPassword("");
    setIncorrectEmailOrPassword(false);
  };

  const handleExitGroup = (e: React.MouseEvent<HTMLDivElement>) => {
    setShowDarkAndLightModeDropDown(false);
    setUserIsExitingTheGroup(true);
    setUserIsChangingGroupName(false);
  };

  const handleDeleteGroup = (e: React.MouseEvent<HTMLDivElement>) => {
    setShowDarkAndLightModeDropDown(false);
    setUserIsExitingTheGroup(true);
    setUserIsChangingGroupName(false);
  };
  const handleGoBack = (e: React.MouseEvent<HTMLDivElement>) => {
    setShowDarkAndLightModeDropDown(false);
    setShowRightSideMobile(false);
  };
  return (
    <div className="mainDropDownContainer">
      <div className="dropdowncontainer" style={drop_Down_Container_Style}>
        <div
          className="DD_firstChild common"
          style={fontColor}
          onClick={handleDarkButton}
        >
          Dark
        </div>
        <hr />

        <div
          className="DD_secondChild common"
          style={fontColor}
          onClick={handleLightButton}
        >
          Light
        </div>
        <hr />
        <div
          onClick={handleLoggout}
          className="DD_secondChild common"
          style={fontColor}
        >
          Logout
        </div>
        <hr />

        {/* { userIsAdmin ? (
          <div
            onClick={handleExitGroup}
            className="DD_secondChild common"
            style={fontColor}
          >
            Exit Group
          </div>
        ) : (
          <div
            onClick={handleDeleteGroup}
            className="DD_secondChild common"
            style={fontColor}
          >
            Delete Group
          </div>
        )} */}

        {showRightSideMobile ? (
          <div
            onClick={handleGoBack}
            className="DD_secondChild common"
            style={fontColor}
          >
            Go Back
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Dropdown;
