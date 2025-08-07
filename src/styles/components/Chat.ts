// import darkBackgroundImage from "";
// // import darkBackgroundImage from "@/assets/dark-bg.jpg";
// import whiteBackgroundImage from "@/assets/light-bg.jpg";
import useAppStore from "@store/AppStore";
import useChatStore from "@store/ChatStore";
("@store/ChatStore");

const dark = useAppStore.getState().dark;
const addMoreFriendsInGroup = useAppStore.getState().addMoreFriendsInGroup;
const userIsExitingTheGroup = useAppStore.getState().userIsExitingTheGroup;
const userIsChangingGroupName = useAppStore.getState().userIsChangingGroupName;
const showLoadingInterface = useChatStore.getState().showLoadingInterface;
const showCreateGroupIntf = useChatStore.getState().showCreateGroupIntf;
const DiscardMyMedia = useChatStore.getState().DiscardMyMedia;
const chatList = useChatStore.getState().chatList;
const showOutgoingCall = useChatStore.getState().showOutgoingCall;
const showIncomingCall = useChatStore.getState().showIncomingCall;

console.log(showCreateGroupIntf);

export const chatMainContainerStyle: React.CSSProperties = {
  zIndex: "1",
  overflow: chatList ? "visible" : "hidden",
  pointerEvents:
    showCreateGroupIntf ||
    DiscardMyMedia ||
    addMoreFriendsInGroup ||
    showLoadingInterface ||
    userIsExitingTheGroup ||
    showOutgoingCall ||
    showIncomingCall ||
    userIsChangingGroupName
      ? "none"
      : "auto",
  filter:
    showCreateGroupIntf ||
    addMoreFriendsInGroup ||
    DiscardMyMedia ||
    showLoadingInterface ||
    userIsExitingTheGroup ||
    showOutgoingCall ||
    showIncomingCall ||
    userIsChangingGroupName
      ? "blur(2px)"
      : "none",
};

export const left_side_Style = {
  background: dark
    ? "linear-gradient(145deg, #1a1a1a, #2c2c2c)"
    : "linear-gradient(145deg, #f4f4f4, #e8e8e8)",
};

export const left_side_Header_Style = {
  background: dark
    ? "linear-gradient(145deg, #1a1a1a, #2c2c2c)"
    : "linear-gradient(145deg, #f4f4f4, #e8e8e8)",
};
