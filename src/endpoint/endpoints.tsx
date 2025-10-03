"use client";

interface EndpointsType {
  homeDir: string;

  registerUser: string;
  loginUser: string;
  verifyToken: string;
  changeGroupName: string;
  updateGroupMembersArray: string;
  fetchUserChats: string;
  userCreatedNewGroup: string;
  userInitiatePrivateChat: string;
  fetchExistingGroups: string;
  fetchChatMessages: string;
  checkUserGroupAffiliations: string;
  unknowRoute: string;
  deleteGroupByAdmin: string;
  leaveGroupByUser: string;
  verifyOTP: string;
  InsertMember: string;
  getNewOTP: string;
  unverifiedEmail: string;
  getHeaders: () => {
    "Content-Type": string;
    Authorization: string;
  };
}

const API_BASE_URL =
  "https://signal-72-backend-867721534855.us-central1.run.app";
// const API_BASE_URL = "http://localhost:3008";

// const API_BASE_URL =
//   "https://efficiency-did-happening-parking.trycloudflare.com";
// const API_BASE_URL = " https://dream-popular-truth-investing.trycloudflare.com";
// const API_BASE_URL = "http://localhost:3008";
// const API_BASE_URL = "https://had-reduce-cork-blogs.trycloudflare.com";
// const API_BASE_URL = "https://syria-ddr-ps-favor.trycloudflare.com";

const getTokenHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const Endpoints: EndpointsType = {
  homeDir: `${API_BASE_URL}/`,
  registerUser: `${API_BASE_URL}/register`,
  loginUser: `${API_BASE_URL}/login`,
  verifyToken: `${API_BASE_URL}/verifyToken`,
  unverifiedEmail: `${API_BASE_URL}/unverifiedEmail`,
  changeGroupName: `${API_BASE_URL}/updateGroupName`,
  updateGroupMembersArray: `${API_BASE_URL}/updateGroupMembersArray`,
  InsertMember: `${API_BASE_URL}/insertMemberInTheGroup`,
  fetchUserChats: `${API_BASE_URL}/groupInformationz`,
  userCreatedNewGroup: `${API_BASE_URL}/groupInformation`,
  userInitiatePrivateChat: `${API_BASE_URL}/privateChat`,
  fetchExistingGroups: `${API_BASE_URL}/EveryGroupsData`,
  fetchChatMessages: `${API_BASE_URL}/fetchMessages`,
  checkUserGroupAffiliations: `${API_BASE_URL}/checkForGroupNames`,
  unknowRoute: `${API_BASE_URL}/groupInformationForGroupMemberCheck`,
  deleteGroupByAdmin: `${API_BASE_URL}/groupDeletion`,
  leaveGroupByUser: `${API_BASE_URL}/groupleaving`,
  verifyOTP: `${API_BASE_URL}/verifyOtp`,
  getNewOTP: `${API_BASE_URL}/getNewOtp`,
  getHeaders: getTokenHeader,
};

export default Endpoints;
