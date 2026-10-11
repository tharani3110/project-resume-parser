import { bandFor } from "../lib/mockParse.js";
import ScoreRing from "./ScoreRing.jsx";

export default function ResultsCard({ status, statusText, report, fileSummary }) {
  if (status === "idle") return null;

  const band = report ? bandFor(report.score) : null;

  return (
    <section className="card" aria-live="polite">
      {status === "analyzing" && (
        <div className="analyzing">
          <span className="spinner" aria-hidden="true" />
          <span>{statusText}</span>
        </div>
      )}

      {status === "done" && report && (
        <div className="results">
          <div className="score-block">
            <ScoreRing score={report.score} />
            <div className="score-meta">
              <h2 style={{ color: band.color }}>{band.label}</h2>
              <p>{fileSummary}</p>
            </div>
          </div>

          <div className="skills-grid">
            <div className="skill-col">
              <h3 className="present-title">
                Present skills <span className="count">({report.present.length})</span>
              </h3>
              <ul className="chips chips-present">
                {report.present.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
            <div className="skill-col">
              <h3 className="missing-title">
                Missing skills <span className="count">({report.missing.length})</span>
              </h3>
              <ul className="chips chips-missing">
                {report.missing.map((skill) => (
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
