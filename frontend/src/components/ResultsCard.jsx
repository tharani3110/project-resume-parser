import { bandFor } from "../lib/bands.js";
import ScoreRing from "./ScoreRing.jsx";

export default function ResultsCard({ status, error, result, summary }) {
  if (status === "idle" && !error) return null;

  const band = result ? bandFor(result.score) : null;

  return (
    <section className="card" aria-live="polite">
      {status === "analyzing" && (
        <div className="analyzing">
          <span className="spinner" aria-hidden="true" />
          <span>Comparing your resume against the job description…</span>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {status === "done" && result && (
        <div className="results">
          <div className="score-block">
            <ScoreRing score={result.score} />
            <div className="score-meta">
              <h2 style={{ color: band.color }}>{band.label}</h2>
              <p>{summary}</p>
              <p>
                Matched <strong>{result.present.length}</strong> of{" "}
                <strong>{result.requiredCount}</strong> skills the posting asks for.
              </p>
            </div>
          </div>

          <div className="skills-grid">
            <div className="skill-col">
              <h3 className="present-title">
                Present skills <span className="count">({result.present.length})</span>
              </h3>
              <ul className="chips chips-present">
                {result.present.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
            <div className="skill-col">
              <h3 className="missing-title">
                Missing skills <span className="count">({result.missing.length})</span>
              </h3>
              <ul className="chips chips-missing">
                {result.missing.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
