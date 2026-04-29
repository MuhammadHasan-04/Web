import { useState } from "react";
import Field from "./components/Field";
import Scoreboard from "./components/Scoreboard";
import PowerBar from "./components/PowerBar";
import Controls from "./components/Controls";
import ResultFlash from "./components/ResultFlash";
import GameOver from "./components/GameOver";
import Commentary from "./components/Commentary";

const outcomes = [0, 1, 2, 3, 4, 6, "W"];

function randomOutcome() {
  return outcomes[Math.floor(Math.random() * outcomes.length)];
}

function Game() {
  const TOTAL_BALLS = 12;
  const TOTAL_WICKETS = 2;

  const [runs, setRuns] = useState(0);
  const [balls, setBalls] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [result, setResult] = useState(null);
  const [commentary, setCommentary] = useState([]);

  function playShot() {
    if (balls >= TOTAL_BALLS || wickets >= TOTAL_WICKETS) return;

    const outcome = randomOutcome();
    setResult(outcome);

    setBalls((b) => b + 1);

    if (outcome === "W") {
      setWickets((w) => w + 1);
      setCommentary((c) => [`Wicket!`, ...c]);
    } else {
      setRuns((r) => r + outcome);
      setCommentary((c) => [`Scored ${outcome}`, ...c]);
    }
  }

  const gameOver = balls >= TOTAL_BALLS || wickets >= TOTAL_WICKETS;

  return (
    <div className="game">
      <Scoreboard runs={runs} balls={balls} wickets={wickets} />

      <Field />

      <PowerBar />

      <Controls playShot={playShot} disabled={gameOver} />

      <ResultFlash result={result} />

      <Commentary commentary={commentary} />

      {gameOver && <GameOver runs={runs} />}
    </div>
  );
}

export default Game;
