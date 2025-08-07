export const playMicAudio = (stream: MediaStream) => {
  alert("playing audio");
  const audioElement = document.createElement("audio");
  audioElement.srcObject = stream;
  audioElement.autoplay = true;
  audioElement.muted = true; // Optional: avoid echo if testing locally
  audioElement.style.display = "none"; // Keep UI clean
  document.body.appendChild(audioElement);
};
