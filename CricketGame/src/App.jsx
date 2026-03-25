import { useState, useEffect, useRef } from "react";
import FieldCanvas from "./components/FieldCanvas";
import Batsman from "./components/Batsman";
import Ball from "./components/Ball";
import Stumps from "./components/Stumps";
import PowerBar from "./components/PowerBar";
import GameOver from "./components/GameOver";
import {
  TOTAL_BALLS,
  TOTAL_WICKETS,
  PROBABILITIES,
  pickCommentary,
} from "./constants";

export default function App() {
  // Game state
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [ballsLeft, setBallsLeft] = useState(TOTAL_BALLS);
  const [style, setStyle] = useState("aggressive");

  const [sliderPos, setSliderPos] = useState(0);
  const [sliderRunning, setSliderRunning] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [lastOutcome, setLastOutcome] = useState(null);
  const [commentary, setCommentary] = useState(
    "Welcome! Select batting style and hit PLAY SHOT to begin.",
  );
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [floatScore, setFloatScore] = useState(null);
  const [wicketShake, setWicketShake] = useState(false);
  const [batSwing, setBatSwing] = useState(false);
  const [ballBowling, setBallBowling] = useState(false);

  const sliderRef = useRef(null);
  const SLIDER_SPEED = 0.012;

  useEffect(() => {
    if (!sliderRunning) return;
    let pos = 0;
    let dir = 1;
    const frame = () => {
      pos += SLIDER_SPEED * dir;
      if (pos >= 1) {
        pos = 1;
        dir = -1;
      }
      if (pos <= 0) {
        pos = 0;
        dir = 1;
      }
      setSliderPos(pos);
      sliderRef.current = requestAnimationFrame(frame);
    };
    sliderRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(sliderRef.current);
  }, [sliderRunning]);

  const segments = PROBABILITIES[style];

  function getOutcomeAt(pos) {
    let cum = 0;
    for (const seg of segments) {
      cum += seg.prob;
      if (pos <= cum) return seg.runs;
    }
    return segments[segments.length - 1].runs;
  }

  function startBall() {
    if (phase !== "idle" || gameOver) return;
    setSliderRunning(true);
    setSliderPos(0);
    setPhase("ready");
  }

  function playShot() {
    if (phase !== "ready") return;
    const capturedPos = sliderPos;
    setSliderRunning(false);

    // Bowling animation
    setPhase("bowling");
    setBallBowling(true);

    setTimeout(() => {
      setBallBowling(false);
      // Batting animation
      setPhase("batting");
      setBatSwing(true);

      setTimeout(() => {
        setBatSwing(false);

        const outcome = getOutcomeAt(capturedPos);
        setLastOutcome(outcome);

        if (outcome === "wicket") {
          setWicketShake(true);
          setTimeout(() => setWicketShake(false), 600);
        }

        // Update scores — use local vars to avoid stale closure issues
        let newRuns = runs;
        let newWickets = wickets;
        let newBalls = ballsLeft - 1;

        if (outcome === "wicket") {
          newWickets = wickets + 1;
          setWickets(newWickets);
        } else {
          newRuns = runs + outcome;
          setRuns(newRuns);
          if (outcome > 0) {
            setFloatScore({ val: `+${outcome}`, id: Date.now() });
            setTimeout(() => setFloatScore(null), 1300);
          }
        }
        setBallsLeft(newBalls);
        setCommentary(pickCommentary(outcome));
        setPhase("result");

        setTimeout(() => {
          setLastOutcome(null);
          if (newWickets >= TOTAL_WICKETS) {
            setGameOver(true);
            setGameOverReason("All Wickets Lost!");
          } else if (newBalls <= 0) {
            setGameOver(true);
            setGameOverReason("Overs Complete!");
          } else {
            setPhase("idle");
          }
        }, 1200);
      }, 500);
    }, 750);
  }

  function handleBarClick() {
    if (phase === "ready") playShot();
    else if (phase === "idle") startBall();
  }

  function resetGame() {
    setRuns(0);
    setWickets(0);
    setBallsLeft(TOTAL_BALLS);
    setStyle("aggressive");
    setSliderPos(0);
    setSliderRunning(false);
    setPhase("idle");
    setLastOutcome(null);
    setCommentary("New match! Select your style and play!");
    setGameOver(false);
    setGameOverReason("");
    setFloatScore(null);
    setWicketShake(false);
    setBatSwing(false);
    setBallBowling(false);
  }

  const isActive = (phase === "idle" || phase === "ready") && !gameOver;
  const currentOver = Math.floor((TOTAL_BALLS - ballsLeft) / 6);
  const currentBall = (TOTAL_BALLS - ballsLeft) % 6;
  const oversStr = `${currentOver}.${currentBall}`;

  // Result display config
  let resultClass = "";
  let resultText = "";
  if (lastOutcome === "wicket") {
    resultClass = "wicket";
    resultText = " WICKET!";
  } else if (lastOutcome === 6) {
    resultClass = "boundary";
    resultText = " SIX!";
  } else if (lastOutcome === 4) {
    resultClass = "boundary";
    resultText = " FOUR!";
  } else if (lastOutcome !== null && lastOutcome > 0) {
    resultClass = "runs";
    resultText = `+${lastOutcome} RUN${lastOutcome > 1 ? "S" : ""}`;
  } else if (lastOutcome === 0) {
    resultClass = "dot";
    resultText = " DOT BALL";
  }

  return (
    <div className="game-container">
      <div className="game-title">🏏 T20 CRICKET BLAST</div>

      {/* Field — left column */}
      <div className="field-wrapper">
        <FieldCanvas />
        <Ball bowling={ballBowling} />
        <Stumps shaking={wicketShake} />

        {/* Batsman */}
        <div style={{ position: "absolute", bottom: 56, left: 150 }}>
          <Batsman swinging={batSwing} />
        </div>

        {/* Floating score */}
        {floatScore && (
          <div
            className="float-score"
            style={{
              left: "42%",
              bottom: 100,
              color: lastOutcome >= 4 ? "#18a84a" : "#c47b10",
            }}
          >
            {floatScore.val}
          </div>
        )}

        {/* Result overlay */}
        {lastOutcome !== null && (
          <div className={`result-display ${resultClass}`}>{resultText}</div>
        )}
      </div>

      {/* RIGHT CONTROLS COLUMN */}
      <div className="controls-col">
        {/* Match Info Bar */}
        <div className="match-bar">
          <span>
            OVERS: <span className="highlight">{oversStr} / 2.0</span>
          </span>
          <span>
            STYLE:{" "}
            <span
              className="highlight"
              style={{ color: style === "aggressive" ? "#d94030" : "#2e7fd4" }}
            >
              {style.toUpperCase()}
            </span>
          </span>
          <div className="wicket-indicators">
            {Array.from({ length: TOTAL_WICKETS }).map((_, i) => (
              <div
                key={i}
                className={`wi-dot${i < wickets ? " lost" : ""}`}
                title={i < wickets ? "Wicket lost" : "Wicket remaining"}
              />
            ))}
          </div>
        </div>

        {/* Scoreboard */}
        <div className="scoreboard">
          <div className="score-cell">
            <div className="score-label">RUNS</div>
            <div className="score-value green">{runs}</div>
          </div>
          <div className="score-cell">
            <div className="score-label">WICKETS</div>
            <div className="score-value red">
              {wickets}/{TOTAL_WICKETS}
            </div>
          </div>
          <div className="score-cell">
            <div className="score-label">BALLS LEFT</div>
            <div className="score-value">{ballsLeft}</div>
          </div>
          <div className="score-cell">
            <div className="score-label">OVERS</div>
            <div className="score-value">{oversStr}</div>
          </div>
        </div>

        {/* Batting Style Selector */}
        <div className="style-selector">
          <button
            className={`style-btn aggressive${style === "aggressive" ? " active" : ""}`}
            onClick={() => {
              if (phase === "idle") setStyle("aggressive");
            }}
            disabled={phase !== "idle"}
          >
            AGGRESSIVE
            <div className="style-desc">High Risk · High Reward</div>
          </button>
          <button
            className={`style-btn defensive${style === "defensive" ? " active" : ""}`}
            onClick={() => {
              if (phase === "idle") setStyle("defensive");
            }}
            disabled={phase !== "idle"}
          >
            DEFENSIVE
            <div className="style-desc">Low Risk · Steady Runs</div>
          </button>
        </div>

        {/* Power Bar */}
        <div className="powerbar-section">
          <PowerBar
            segments={segments}
            sliderPos={sliderPos}
            active={phase === "ready"}
            onClick={playShot}
          />
          {/* Probability legend */}
          <div
            style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}
          >
            {segments.map((seg, i) => (
              <div
                key={i}
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border)",
                  borderRadius: 5,
                  padding: "3px 7px",
                  fontSize: "0.68rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span
                  className={`pb-segment ${seg.cls}`}
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    marginRight: 4,
                    verticalAlign: "middle",
                  }}
                />
                {seg.label}: {(seg.prob * 100).toFixed(0)}%
              </div>
            ))}
          </div>
        </div>

        {/* Play / Action Button */}
        <button
          className="play-btn"
          onClick={() => {
            if (phase === "idle") startBall();
            else if (phase === "ready") playShot();
          }}
          disabled={!isActive}
        >
          {phase === "idle"
            ? " START BALL"
            : phase === "ready"
              ? " PLAY SHOT!"
              : phase === "bowling"
                ? " BALL INCOMING..."
                : phase === "batting"
                  ? " PLAYING..."
                  : " WAIT..."}
        </button>
      </div>
      {/* end controls-col */}

      {/* Commentary — full width bottom */}
      <div className="commentary-box">
        <div className="comm-badge">🎙️ COMMENTARY</div>
        {commentary}
      </div>

      {/* Game Over */}
      {gameOver && (
        <GameOver
          runs={runs}
          wickets={wickets}
          ballsLeft={ballsLeft}
          gameOverReason={gameOverReason}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}
