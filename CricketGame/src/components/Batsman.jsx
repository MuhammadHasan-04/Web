export default function Batsman({ swinging }) {
  return (
    <svg
      width="70"
      height="100"
      viewBox="0 0 70 100"
      style={{
        transform: "scaleX(-1)",
        filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.6))",
      }}
    >
      <rect x="22" y="65" width="10" height="30" rx="4" fill="#f1f1f1" />
      <rect x="36" y="65" width="10" height="30" rx="4" fill="#f1f1f1" />

      <ellipse cx="27" cy="95" rx="10" ry="5" fill="#222" />
      <ellipse cx="41" cy="95" rx="10" ry="5" fill="#222" />

      <rect x="21" y="68" width="12" height="22" rx="4" fill="#e0e0e0" />
      <rect x="35" y="68" width="12" height="22" rx="4" fill="#e0e0e0" />

      <rect
        x="18"
        y="38"
        width="34"
        height="30"
        rx="8"
        fill="url(#jerseyGradient)"
      />

      <defs>
        <linearGradient id="jerseyGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e88e5" />
          <stop offset="100%" stopColor="#0d47a1" />
        </linearGradient>
      </defs>

      <text
        x="35"
        y="58"
        textAnchor="middle"
        fontSize="12"
        fill="#ffd700"
        fontWeight="bold"
      >
        18
      </text>

      <rect x="8" y="42" width="12" height="6" rx="3" fill="#1565c0" />
      <rect x="50" y="42" width="12" height="6" rx="3" fill="#1565c0" />

      <circle cx="35" cy="24" r="14" fill="#e0ac69" />

      <path d="M21 20 Q35 5 49 20" stroke="#111" strokeWidth="2" fill="#111" />
      <rect x="21" y="18" width="28" height="8" rx="3" fill="#111" />
      <rect x="21" y="24" width="12" height="5" rx="2" fill="#444" />

      <g
        style={{
          transformOrigin: "10px 75px",
          transform: swinging ? "rotate(-40deg)" : "rotate(12deg)",
          transition: "transform 0.12s ease-in-out",
        }}
      >
        <rect x="5" y="50" width="6" height="45" rx="3" fill="#6d4c41" />
        <rect x="3" y="75" width="12" height="20" rx="3" fill="#d7a86e" />
      </g>
    </svg>
  );
}
