import iconsawr from "../assets/images/profile.png";

export function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }
}

export function showNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    const notify = new Notification(title, {
      body,
      // icon: "../assets/images/profile.png", // 🔁 Replace with the path to your icon
    });

    notify.onclick = () => {
      console.log("Notification was clicked!");
      alert("Notification clicked");
      window.focus();
      // window.location.href = "/chat"; // Optional
    };
  }
}
