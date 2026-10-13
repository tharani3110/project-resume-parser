import { useState } from "react";
import Dropzone from "./components/Dropzone.jsx";
import ResultsCard from "./components/ResultsCard.jsx";
import { analyzeResume } from "./lib/api.js";

export default function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState("idle"); // idle | analyzing | done
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  function handleFile(next) {
    setFile(next);
    setError(null);
    setStatus("idle");
    setResult(null);
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Upload your resume PDF first.");
      return;
    }
    if (jobDescription.trim().length < 30) {
      setError("Paste the job description so there is something to compare the resume against.");
      return;
    }

    setError(null);
    setResult(null);
    setStatus("analyzing");

    try {
      const data = await analyzeResume(file, jobDescription);
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <span className="wordmark">
            Project <span className="accent">Resume Parser</span>
          </span>
          <span className="badge">resume × job description</span>
        </div>
      </header>

      <main>
        <section className="hero">
          <h1>
            Match a resume to a job posting,
            <br />
            and see the gap <span className="accent">in skills</span>.
          </h1>
          <p>
            Upload a resume PDF and paste the job description. You get a match score out of 100,
            the skills the posting asks for that the resume shows, and the ones it is missing.
          </p>
        </section>

        <section className="card">
          <Dropzone onFile={handleFile} fileName={file?.name} />

          <div className="jd-field">
            <label htmlFor="jobDescription">Job description</label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the posting here — responsibilities, requirements, the whole thing."
              rows={8}
            />
          </div>

          <button
            type="button"
            className="btn"
            onClick={handleAnalyze}
            disabled={status === "analyzing"}
          >
            {status === "analyzing" ? "Analyzing…" : "Analyze match"}
          </button>
        </section>

        <ResultsCard
          status={status}
          error={error}
          result={result}
          summary={file ? `${file.name} · ${Math.max(1, Math.round(file.size / 1024))} KB` : ""}
        />
      </main>

      <footer>
        <p>
          The scoring runs on the Express API in <code>backend/</code> and is stored in MongoDB.
          Resume parsing is still mocked — the AI step plugs in later.
        </p>
      </footer>
    </>
  );
}
