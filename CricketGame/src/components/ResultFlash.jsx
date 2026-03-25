function ResultFlash({ result }) {
  if (result === null) return null;

  return (
    <div className="resultflash">
      {result === "W" ? "WICKET!" : `${result} RUNS`}
    </div>
  );
}

export default ResultFlash;
