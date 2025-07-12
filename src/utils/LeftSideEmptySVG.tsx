export default function ChatTypingIcon() {
  return (
    <svg width="100" height="80" viewBox="0 0 100 80">
      <g transform="translate(20,30)">
        <rect
          x="0"
          y="0"
          rx="10"
          ry="10"
          width="60"
          height="40"
          fill="#4A90E2"
        />
        <polygon points="20,40 30,50 40,40" fill="#4A90E2" />
        {[0, 15, 30].map((cx, i) => (
          <circle key={i} cx={15 + cx} cy="20" r="5" fill="white">
            <animate
              attributeName="r"
              values="5;8;5"
              dur="1s"
              repeatCount="indefinite"
              begin={`${i * 0.2}s`}
            />
          </circle>
        ))}
      </g>
    </svg>
  );
}
