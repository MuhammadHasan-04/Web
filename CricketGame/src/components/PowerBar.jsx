export default function PowerBar({ segments, sliderPos, active, onClick }) {
  // Build cumulative thresholds
  let cumulative = 0;
  const thresholds = segments.map((s) => {
    const start = cumulative;
    cumulative += s.prob;
    return { ...s, start, end: cumulative };
  });

  return (
    <div>
      <div className="powerbar-label"> POWER BAR — CLICK TO PLAY SHOT</div>
      <div
        className="powerbar-outer"
        onClick={active ? onClick : undefined}
        title={active ? "Click to play shot!" : ""}
      >
        <div className="powerbar-segments">
          {thresholds.map((seg, i) => (
            <div
              key={i}
              className={`pb-segment ${seg.cls}`}
              style={{ width: `${seg.prob * 100}%` }}
              title={`${seg.label}: ${(seg.prob * 100).toFixed(0)}%`}
            >
              {seg.prob >= 0.07 ? seg.label : ""}
            </div>
          ))}
        </div>

        {active && (
          <>
            <div className="pb-arrow" style={{ left: `${sliderPos * 100}%` }} />
            <div
              className="pb-slider"
              style={{ left: `${sliderPos * 100}%` }}
            />
          </>
        )}
      </div>

      <div
        className="pb-ticks"
        style={{ position: "relative", marginTop: 4, height: 16 }}
      >
        {thresholds.map((seg, i) => (
          <span
            key={i}
            className="pb-tick-label"
            style={{ left: `${seg.end * 100}%` }}
          >
            {seg.end.toFixed(2)}
          </span>
        ))}
      </div>
    </div>
  );
}
