// Pure scoring logic — no DOM, no React. Swap mockParse() for a real
// parser (e.g. pdf.js + a scoring function) and the UI keeps working unchanged.

export const SKILL_CATALOG = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL",
  "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Git",
  "REST APIs", "CI/CD", "Unit testing", "HTML/CSS", "Tailwind",
  "System design", "GraphQL", "Redis",
];

export function mockParse(file) {
  // Seeded by name + size, so the same file always scores the same —
  // like a real parser — while different files get different results.
  const rand = mulberry32(hashString(`${file.name}:${file.size}`));
  const skills = [...SKILL_CATALOG];
  shuffle(skills, rand);

  const presentCount = 8 + Math.floor(rand() * 7); // 8–14 of 20 skills
  const present = skills.slice(0, presentCount);
  const missing = skills.slice(presentCount);

  const score = Math.max(25, Math.min(96,
    Math.round(
      (presentCount / SKILL_CATALOG.length) * 55 + 30 + rand() * 12 + (presentCount >= 13 ? 8 : 0)
    )
  ));

  return { score, present, missing };
}

export function bandFor(score) {
  if (score >= 85) return { label: "Shipped-ready", color: "#34d399" };
  if (score >= 70) return { label: "Strong candidate", color: "#34d399" };
  if (score >= 50) return { label: "Getting there", color: "#fbbf24" };
  return { label: "Needs work", color: "#f87171" };
}

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
