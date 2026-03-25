function Scoreboard({ runs, balls, wickets }) {
  return (
    <div className="scoreboard">
      <div>Runs: {runs}</div>
      <div>Balls: {balls}</div>
      <div>Wickets: {wickets}</div>
    </div>
  );
}

export default Scoreboard;
