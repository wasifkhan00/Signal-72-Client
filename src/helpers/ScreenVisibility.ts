import sockets from "../websockets/websockets";

export function handleTabFocus() {
  const reconnectOnFocus = () => {
    if (document.visibilityState === "visible" && !sockets.connected) {
      sockets.connect();
    }
  };

  document.removeEventListener("visibilitychange", reconnectOnFocus); // Prevent duplicate listeners
  document.addEventListener("visibilitychange", reconnectOnFocus);
}
