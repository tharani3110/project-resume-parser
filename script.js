// Mock resume parser — everything below runs in the browser, no backend.
// Swap `mockParse()` for a real parser (e.g. pdf.js + a scoring function) later.

const SKILL_CATALOG = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL",
  "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Git",
  "REST APIs", "CI/CD", "Unit testing", "HTML/CSS", "Tailwind",
  "System design", "GraphQL", "Redis",
];

const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const errorMessage = document.getElementById("errorMessage");
const resultsCard = document.getElementById("resultsCard");
const analyzing = document.getElementById("analyzing");
const analyzingStatus = document.getElementById("analyzingStatus");
const results = document.getElementById("results");
const ringFill = document.getElementById("ringFill");
const scoreValue = document.getElementById("scoreValue");
const scoreLabel = document.getElementById("scoreLabel");
const fileSummary = document.getElementById("fileSummary");
const presentList = document.getElementById("presentSkills");
const missingList = document.getElementById("missingSkills");
const presentCount = document.getElementById("presentCount");
const missingCount = document.getElementById("missingCount");

let runId = 0;
let countUpId = null;

// --- Upload wiring -----------------------------------------------------------

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
  fileInput.value = ""; // allow re-selecting the same file
});

["dragenter", "dragover"].forEach((type) =>
  dropzone.addEventListener(type, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  })
);

["dragleave", "drop"].forEach((type) =>
  dropzone.addEventListener(type, () => dropzone.classList.remove("dragover"))
);

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file) {
    showError("Drop a PDF file.");
    return;
  }
  handleFile(file);
});

function handleFile(file) {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    showError(`"${file.name}" isn't a PDF. Drop a .pdf resume.`);
    return;
  }
  clearError();
  runMockAnalysis(file);
}

// --- The mock pipeline -------------------------------------------------------

async function runMockAnalysis(file) {
  const myRun = ++runId; // a new drop cancels a still-running analysis

  resultsCard.hidden = false;
  results.hidden = true;
  analyzing.hidden = false;

  const steps = ["Uploading resume…", "Extracting text…", "Matching skills…", "Scoring…"];
  for (const step of steps) {
    analyzingStatus.textContent = step;
    await sleep(430);
    if (myRun !== runId) return;
  }

  const report = mockParse(file);
  analyzing.hidden = true;
  results.hidden = false;
  renderReport(file, report);
}

function mockParse(file) {
  // Seeded by name + size, so the same file always scores the same —
  // like a real parser — while different files get different results.
  const rand = mulberry32(hashString(`${file.name}:${file.size}`));
  const skills = [...SKILL_CATALOG];
  shuffle(skills, rand);

  const presentCountN = 8 + Math.floor(rand() * 7); // 8–14 of 20 skills
  const present = skills.slice(0, presentCountN);
  const missing = skills.slice(presentCountN);

  const score = Math.max(25, Math.min(96,
    Math.round(
      (presentCountN / SKILL_CATALOG.length) * 55 + 30 + rand() * 12 + (presentCountN >= 13 ? 8 : 0)
    )
  ));

  return { score, present, missing };
}

// --- Rendering ---------------------------------------------------------------

function renderReport(file, report) {
  const band = bandFor(report.score);

  ringFill.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - report.score / 100);
  ringFill.style.stroke = band.color;
  scoreLabel.textContent = band.label;
  scoreLabel.style.color = band.color;
  fileSummary.textContent = `${file.name} · ${Math.max(1, Math.round(file.size / 1024))} KB · mock parse`;

  countUp(report.score);

  presentList.replaceChildren(...report.present.map((s) => chip(s)));
  missingList.replaceChildren(...report.missing.map((s) => chip(s)));
  presentCount.textContent = `(${report.present.length})`;
  missingCount.textContent = `(${report.missing.length})`;
}

function bandFor(score) {
  if (score >= 85) return { label: "Shipped-ready", color: "#34d399" };
  if (score >= 70) return { label: "Strong candidate", color: "#34d399" };
  if (score >= 50) return { label: "Getting there", color: "#fbbf24" };
  return { label: "Needs work", color: "#f87171" };
}

function chip(text) {
  const li = document.createElement("li");
  li.textContent = text;
  return li;
}

function countUp(target) {
  if (countUpId) cancelAnimationFrame(countUpId);
  const from = Number(scoreValue.textContent) || 0;
  const start = performance.now();

  const tick = (now) => {
    const t = Math.min(1, (now - start) / 900);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    scoreValue.textContent = Math.round(from + (target - from) * eased);
    if (t < 1) countUpId = requestAnimationFrame(tick);
  };
  countUpId = requestAnimationFrame(tick);
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.hidden = true;
}

// --- Helpers -----------------------------------------------------------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
