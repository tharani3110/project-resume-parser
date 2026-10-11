import { useRef, useState } from "react";
import Dropzone from "./components/Dropzone.jsx";
import ResultsCard from "./components/ResultsCard.jsx";
import { mockParse } from "./lib/mockParse.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const STEPS = ["Uploading resume…", "Extracting text…", "Matching skills…", "Scoring…"];

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | analyzing | done
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [fileSummary, setFileSummary] = useState("");
  const runRef = useRef(0); // lets a new upload cancel an in-flight one

  async function handleFile(file) {
    if (!file) {
      setError("Drop a PDF file.");
      return;
    }
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError(`"${file.name}" isn't a PDF. Drop a .pdf resume.`);
      return;
    }

    const myRun = ++runRef.current;
    setError(null);
    setReport(null);
    setStatus("analyzing");

    for (const step of STEPS) {
      setStatusText(step);
      await sleep(430);
      if (runRef.current !== myRun) return; // a newer upload superseded this one
    }

    setFileSummary(`${file.name} · ${Math.max(1, Math.round(file.size / 1024))} KB · mock parse`);
    setReport(mockParse(file));
    setStatus("done");
  }

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <span className="wordmark">
            Project <span className="accent">Resume Parser</span>
          </span>
          <span className="badge">mock · no backend</span>
        </div>
      </header>

      <main>
        <section className="hero">
          <h1>
            Upload a PDF.
            <br />
            See what your resume <span className="accent">actually signals</span>.
          </h1>
          <p>
            A mock resume parser — no backend, no sign-up. Drop your resume and get a score out of
            100, plus the skills it finds and the ones it doesn't.
          </p>
        </section>

        <section className="card">
          <Dropzone onFile={handleFile} error={error} />
        </section>

        <ResultsCard
          status={status}
          statusText={statusText}
          report={report}
          fileSummary={fileSummary}
        />
      </main>

      <footer>
        <p>
          Mock build — the parse is simulated in your browser. When the backend ships, swap{" "}
          <code>mockParse()</code> in <code>src/lib/mockParse.js</code> for the real thing.
        </p>
      </footer>
    </>
  );
}
