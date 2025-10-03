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
