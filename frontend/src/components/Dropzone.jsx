import { useRef, useState } from "react";

export default function Dropzone({ onFile, fileName, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const dragHandlers = {
    onDragEnter: (e) => {
      e.preventDefault();
      setDragOver(true);
    },
    onDragOver: (e) => {
      e.preventDefault();
      setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e) => {
      e.preventDefault();
      setDragOver(false);
      onFile(e.dataTransfer.files[0] ?? null);
    },
  };

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <>
      <div
        className={`dropzone${dragOver ? " dragover" : ""}`}
        tabIndex={0}
        role="button"
        aria-label="Upload a PDF resume"
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        {...dragHandlers}
      >
        <svg
          className="drop-icon"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        <p className="drop-title">{fileName ?? "Drop your resume here"}</p>
        <p className="drop-sub">
          {fileName ? "Click to choose a different PDF" : "PDF only — or click to browse"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          hidden
          onChange={(e) => {
            onFile(e.target.files[0] ?? null);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
      </div>
      {error && <p className="error">{error}</p>}
    </>
  );
}
