// ========== CONSTANTS ==========
export const TOTAL_BALLS = 12;
export const TOTAL_WICKETS = 2;

// Probability distributions
export const PROBABILITIES = {
  aggressive: [
    { label: "W", runs: "wicket", prob: 0.3, cls: "seg-wicket" },
    { label: "0", runs: 0, prob: 0.08, cls: "seg-0" },
    { label: "1", runs: 1, prob: 0.1, cls: "seg-1" },
    { label: "2", runs: 2, prob: 0.1, cls: "seg-2" },
    { label: "3", runs: 3, prob: 0.07, cls: "seg-3" },
    { label: "4", runs: 4, prob: 0.15, cls: "seg-4" },
    { label: "6", runs: 6, prob: 0.2, cls: "seg-6" },
  ],
  defensive: [
    { label: "W", runs: "wicket", prob: 0.15, cls: "seg-wicket" },
    { label: "0", runs: 0, prob: 0.25, cls: "seg-0" },
    { label: "1", runs: 1, prob: 0.3, cls: "seg-1" },
    { label: "2", runs: 2, prob: 0.15, cls: "seg-2" },
    { label: "3", runs: 3, prob: 0.05, cls: "seg-3" },
    { label: "4", runs: 4, prob: 0.07, cls: "seg-4" },
    { label: "6", runs: 6, prob: 0.03, cls: "seg-6" },
  ],
};

// Commentary lines
export const COMMENTARY = {
  wicket: [
    " BOWLED HIM! The stumps are shattered! What a delivery!",
    " OUT! The batsman fell for the trap — wicket maiden!",
    " GONE! The ball sneaks through and flattens the stumps!",
    " DISMISSED! The fielder takes a sharp catch at mid-on!",
  ],
  boundary6: [
    " SIX! That's gone all the way over the boundary rope!",
    " MAXIMUM! A towering six into the crowd!",
    " SIX! Muscle and timing — this ball is still travelling!",
    " OUT OF THE PARK! Absolutely stunning shot!",
  ],
  boundary4: [
    " FOUR! Races away through the covers — beautiful timing!",
    " FOUR! Pierced the gap and raced to the boundary!",
    " BOUNDARY! The ball reaches the rope in style!",
    " FOUR! The batsman drives superbly along the ground!",
  ],
  runs: [
    " Good running between the wickets!",
    " Sensible batting — taking what's on offer.",
    " They scamper through for the runs!",
    " Smart play — keeps the scoreboard ticking.",
  ],
  dot: [
    " Defended solidly — dot ball.",
    " No run! The bowler wins this one.",
    " Tight line and length — no room to hit.",
    " Excellent bowling — nothing to hit there.",
  ],
};

export function pickCommentary(outcome) {
  let pool;
  if (outcome === "wicket") pool = COMMENTARY.wicket;
  else if (outcome === 6) pool = COMMENTARY.boundary6;
  else if (outcome === 4) pool = COMMENTARY.boundary4;
  else if (outcome === 0) pool = COMMENTARY.dot;
  else pool = COMMENTARY.runs;
  return pool[Math.floor(Math.random() * pool.length)];
}
