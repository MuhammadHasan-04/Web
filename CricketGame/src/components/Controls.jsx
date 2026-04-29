function Controls({ playShot, disabled }) {
  return (
    <div className="controls">
      <button onClick={playShot} disabled={disabled}>
        Play Shot
      </button>
    </div>
  );
}

export default Controls;
