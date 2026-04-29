export default function Stumps({ shaking }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 120,
        display: 'flex',
        gap: 4,
        alignItems: 'flex-end',
        animation: shaking ? 'wicket-shake 0.5s ease' : 'none',
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 38,
            background: 'linear-gradient(to bottom, #f5deb3, #c8a06a)',
            borderRadius: 2,
            position: 'relative',
          }}
        >
          {i < 2 && (
            <div
              style={{
                position: 'absolute',
                top: -3,
                left: 3,
                width: 18,
                height: 4,
                background: '#f5deb3',
                borderRadius: 2,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
