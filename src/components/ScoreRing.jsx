import { useEffect, useState } from "react";
import { bandFor } from "../lib/mockParse.js";

const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

export default function ScoreRing({ score }) {
  const [shown, setShown] = useState(0);
  const [offset, setOffset] = useState(RING_CIRCUMFERENCE);
  const band = bandFor(score);

  // The ring animates via the CSS transition on .ring-fill —
  // changing the offset after first paint is all it takes.
  useEffect(() => {
    setOffset(RING_CIRCUMFERENCE * (1 - score / 100));
  }, [score]);

  // The number can't be animated by CSS, so count it up here.
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setShown(Math.round(score * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="ring-wrap">
      <svg className="score-ring" viewBox="0 0 120 120" width="128" height="128" aria-hidden="true">
        <circle className="ring-bg" cx="60" cy="60" r="52" />
        <circle
          className="ring-fill"
          cx="60"
          cy="60"
          r="52"
          transform="rotate(-90 60 60)"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ stroke: band.color }}
        />
      </svg>
      <div className="score-number">
        <span>{shown}</span>
        <span className="out-of">/100</span>
      </div>
    </div>
  );
}
