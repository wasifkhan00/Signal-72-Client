import { Factory } from "lucide-react";

export const getMicrophoneAccess = async (): Promise<MediaStream | null> => {
  try {
    const micPermission = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });

    if (micPermission.state === "denied") {
      alert(
        "Microphone access is blocked.\n\nPlease click the lock icon in your browser's address bar and set Microphone to 'Allow', then refresh the page."
      );
      console.warn("Microphone permission denied.");
      return { success: false, Reason: "permission denied" };
    }
    const awaitingpermission = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    return { success: true, Stream: awaitingpermission };
  } catch (error) {
    console.error("getUserMedia threw:", (error as Error).message);
    return { success: false, Reason: error.message };
  }
};
