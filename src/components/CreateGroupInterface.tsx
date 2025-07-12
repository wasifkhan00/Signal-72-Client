import React, { useRef, useEffect } from "react";
import "../styles/chatInterface.css";
import User from "../components/User";
import {
  findUserByEmail,
  checkIfUserAlreadyCreatedGroup,
  handleCreateGroup,
  usersComponentOnclick,
  handleCreateContact,
} from "../lib/CreateGroupInterfaceApi";
import useCreateGroupStore from "@store/CreateGroupInterfaceStore";
import { AuthStore } from "@store/AuthStore";
import useChatStore from "@store/ChatStore";
import debounce from "debounce";
import UserTag from "@utils/SmallTag";

const Create_Group_Interface = () => {
  const { emailAddress } = AuthStore();
  const {
    setShowCreateGroupIntf,
    showCreateGroupIntf,
    isModePrivateChat,
    selectedGroupMemberPayload,
  } = useChatStore();

  const {
    groupMembersResponse,
    groupMembersInputValue,
    setGroupMembersInputValue,
    showResponsesFromApi,
    setWarningMsg,
    setShowResponsesFromApi,
    warningMsg,
  } = useCreateGroupStore();
  const groupMembersInputValues = useRef<HTMLInputElement>(null);
  const groupNameInput = useRef<HTMLInputElement | null>(null);

  const warning_Color = {
    color: "white",
    fontSize: "11px",
  };

  useEffect(() => {
    // User Exists and Havent Created Any Group or Added by others
    checkIfUserAlreadyCreatedGroup();
  }, []);

  useEffect(() => {
    const findUserByEmailDebounced = debounce(findUserByEmail, 1200);
    if (groupMembersInputValue !== "") {
      findUserByEmailDebounced();
    }
  }, [groupMembersInputValue]);

  function removeTheSpan(e: React.MouseEvent<HTMLInputElement>) {
    const emailToRemove = e.currentTarget.getAttribute("data-user-email");
    //  const chatStore = useChatStore.getState();

    // Filter out the member with the clicked email

    setWarningMsg("");
  }

  const handleClickOnFirstInput = (e: React.MouseEvent<HTMLInputElement>) => {
    setShowResponsesFromApi(false);
  };

  const handleClickSecondInputContainer = (
    e: React.MouseEvent<HTMLInputElement>
  ) => {
    if (groupMembersResponse.length > 0) {
      setShowResponsesFromApi(!showResponsesFromApi);
    } else {
      return null;
    }
  };

  const handleChangeSecondInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!value) {
      setWarningMsg("Email field cannot be empty.");
    } else if (value === emailAddress) {
      setWarningMsg("You cannot add yourself in the group.");
    } else {
      setWarningMsg("");
      setGroupMembersInputValue(value);
    }
  };

  const handleCancelButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowCreateGroupIntf(!showCreateGroupIntf);
    setWarningMsg("");
    groupNameInput.current!.value = "";
    groupMembersInputValues.current!.value = "";
  };

  return (
    <>
      <div className="createGroupInterfaceContainer">
        <input
          onClick={handleClickOnFirstInput}
          ref={groupNameInput}
          type="text"
          maxLength={34}
          placeholder={
            isModePrivateChat ? "Full Name" : "Choose your group's name..."
          }
          required
        />

        <div className="inputSecondContainer">
          <input
            ref={groupMembersInputValues}
            onClick={handleClickSecondInputContainer}
            type="text"
            onChange={handleChangeSecondInput}
            required
            maxLength={34}
            placeholder="Add your friends by email Address..."
          />
          {warningMsg && (
            <small style={{ color: "red", fontSize: "10px" }}>
              {warningMsg}
            </small>
          )}

          <div className="SelectedUsersContainer" style={warning_Color}>
            {selectedGroupMemberPayload && selectedGroupMemberPayload.length > 0
              ? selectedGroupMemberPayload.map(
                  (group: any, groupIndex: number) =>
                    group.email !== emailAddress ? (
                      <React.Fragment key={groupIndex}>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <UserTag
                            email={group.email}
                            name={group.userName}
                            onRemove={removeTheSpan}
                          />
                        </div>
                      </React.Fragment>
                    ) : null
                )
              : null}
          </div>
        </div>

        {showResponsesFromApi ? (
          <div className="containerOfResponses">
            {groupMembersResponse.length > 0
              ? groupMembersResponse.map((users) => {
                  return (
                    <React.Fragment key={users.userId}>
                      <User
                        userId={users.userEmail}
                        showCursor={true}
                        marginTop=".4rem"
                        groupName={users.userEmail}
                        lastMessage={users.userName}
                        wholeElementClicked={usersComponentOnclick}
                      />
                    </React.Fragment>
                  );
                })
              : null}
          </div>
        ) : null}

        <div className="createGroupInterfaceButtons">
          <button
            onClick={() =>
              isModePrivateChat
                ? handleCreateContact({ groupNameInput })
                : handleCreateGroup({ groupNameInput })
            }
          >
            {isModePrivateChat ? "Create Contact" : "Create Group"}
          </button>
          <button onClick={handleCancelButton}>Cancel</button>
        </div>
      </div>
    </>
  );
};

export default Create_Group_Interface;
