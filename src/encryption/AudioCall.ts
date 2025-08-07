import useChatStore from "@store/ChatStore";
import sockets from "../websockets/websockets";
import { AuthStore } from "@store/AuthStore";
import { chatMainContainerStyle } from "../styles/components/Chat";
import { getMicrophoneAccess } from "../helpers/MicrophonePermission";
import { playMicAudio } from "../Testing/AudioTesting";

let peerConnection: RTCPeerConnection;

export const handleAudioCall = async (e: EventListenerObject) => {
  const { selectedChat, setShowOutgoingCall } = useChatStore.getState();

  setShowOutgoingCall(true);
  const { emailAddress } = AuthStore.getState();
  const otherEmail =
    selectedChat.chatInitiatedFrom.email === emailAddress
      ? selectedChat.chatInitiatedTo.email
      : selectedChat.chatInitiatedFrom.email;

  const micAccess = await getMicrophoneAccess();

  if (!micAccess.success) return;

  const stream = micAccess.Stream;

  // *************************************************************************************************************************AI

  // Step 1: Create RTCPeerConnection
  peerConnection = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }, // Free STUN server
    ],
  });

  // Step 2: Add stream to connection
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });

  // Step 3: Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sockets.emit("ice-candidate", {
        to: otherEmail,
        candidate: event.candidate,
      });
    }
  };

  // Step 4: Create Offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log(offer);
  console.log(peerConnection);
  // Step 5: Emit offer to receiver
  sockets.emit("call-user", {
    to: otherEmail,
    from: emailAddress,
    chatId: selectedChat.chatId,
    offer: offer,
  });
  // *************************************************************************************************************************AI

  //   if (selectedChat?.type === "private") {
  //     console.log(otherEmail);
  //     sockets.emit("call-user", {
  //       to: otherEmail,
  //       from: emailAddress,
  //       chatId: selectedChat.chatId,
  //     });
  //   }
};
