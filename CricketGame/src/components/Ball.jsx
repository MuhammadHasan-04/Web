export default function Ball({ bowling }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: bowling ? undefined : '80px',
        bottom: '92px',
        width: 20,
        height: 20,
        transition: 'none',
        animation: bowling
          ? 'ballTravel 0.75s cubic-bezier(0.4,0,0.6,1) forwards'
          : 'none',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20">
        <defs>
          <radialGradient id="ballGrad" cx="35%" cy="35%">
            <stop offset="0%"   stopColor="#ff6666" />
            <stop offset="100%" stopColor="#8b0000" />
          </radialGradient>
        </defs>
        <circle cx="10" cy="10" r="9" fill="url(#ballGrad)" />
        <path d="M5 10 Q10 6 15 10 Q10 14 5 10"  stroke="#fff" strokeWidth="0.8" fill="none" />
        <path d="M10 5 Q14 10 10 15 Q6 10 10 5"  stroke="#fff" strokeWidth="0.8" fill="none" />
      </svg>
    </div>
  );
}
