import { TOTAL_BALLS, TOTAL_WICKETS } from "../constants";

export default function GameOver({
  runs,
  wickets,
  ballsLeft,
  gameOverReason,
  onRestart,
}) {
  const ballsFaced = TOTAL_BALLS - ballsLeft;
  const strikeRate =
    ballsFaced > 0 ? ((runs / ballsFaced) * 100).toFixed(1) : "0.0";

  const message =
    runs >= 60
      ? " Brilliant innings! You're a match winner!"
      : runs >= 40
        ? " Solid batting! Great effort!"
        : runs >= 20
          ? " Decent knock. Keep practicing!"
          : " Tough match. Better luck next time!";

  return (
    <div className="gameover-overlay">
      <div className="gameover-card">
        <div className="gameover-title"> INNINGS OVER</div>
        <div className="gameover-reason">{gameOverReason}</div>
        <div className="gameover-stats">
          <div className="go-stat">
            <div className="go-stat-label">TOTAL RUNS</div>
            <div className="go-stat-val">{runs}</div>
          </div>
          <div className="go-stat">
            <div className="go-stat-label">WICKETS LOST</div>
            <div className="go-stat-val">
              {wickets}/{TOTAL_WICKETS}
            </div>
          </div>
          <div className="go-stat">
            <div className="go-stat-label">BALLS FACED</div>
            <div className="go-stat-val">{ballsFaced}</div>
          </div>
          <div className="go-stat">
            <div className="go-stat-label">STRIKE RATE</div>
            <div className="go-stat-val">{strikeRate}</div>
          </div>
        </div>
        <div style={{ marginBottom: 12, fontSize: "0.85rem", color: "#aaa" }}>
          {message}
        </div>
        <button className="restart-btn" onClick={onRestart}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
