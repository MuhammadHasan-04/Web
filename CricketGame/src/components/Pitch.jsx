import { useState } from "react";

export default function Pitch() {
  const [hit, setHit] = useState(false);

  function triggerHit() {
    setHit(true);
    setTimeout(() => setHit(false), 200);
  }

  window.addEventListener("click", triggerHit);

  return (
    <div className="pitch">
      <div className={`batsman ${hit ? "hit" : ""}`}></div>
      <div className="ball"></div>
    </div>
  );
}
