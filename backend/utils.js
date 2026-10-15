// Pure helpers and the mock analysis engine.
//
// When the AI step lands, `analyzeResume` is the one function whose body
// changes — the matching and seeding around it stay useful as the fallback.

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Word-boundary matching: "js" must not light up inside "json", and the dot in
// "Node.js" must not let its "js" count as JavaScript. That second one is the
// sneakier false positive, and the `.` in the lookbehind is what prevents it.
export function matchesAlias(text, alias) {
  const pattern = new RegExp(`(?<![a-z0-9.])${escapeRegex(alias)}(?![a-z0-9])`, "i");
  return pattern.test(text);
}

// Skills we recognize, with the spellings people actually write in postings.
export const SKILL_CATALOG = [
  { name: "JavaScript", aliases: ["javascript", "js", "es6", "ecmascript"] },
  { name: "TypeScript", aliases: ["typescript", "ts"] },
  { name: "React", aliases: ["react", "react.js", "reactjs"] },
  { name: "Node.js", aliases: ["node.js", "nodejs", "node"] },
  { name: "Python", aliases: ["python"] },
  { name: "SQL", aliases: ["sql"] },
  { name: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { name: "MongoDB", aliases: ["mongodb", "mongo"] },
  { name: "Docker", aliases: ["docker", "containerization"] },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { name: "AWS", aliases: ["aws", "amazon web services"] },
  { name: "Git", aliases: ["git", "version control"] },
  { name: "REST APIs", aliases: ["rest", "rest api", "restful", "apis"] },
  { name: "CI/CD", aliases: ["ci/cd", "cicd", "continuous integration"] },
  { name: "Unit testing", aliases: ["unit testing", "jest", "vitest", "pytest", "testing"] },
  { name: "HTML/CSS", aliases: ["html", "css", "html/css"] },
  { name: "Tailwind", aliases: ["tailwind"] },
  { name: "System design", aliases: ["system design", "distributed systems", "architecture"] },
  { name: "GraphQL", aliases: ["graphql"] },
  { name: "Redis", aliases: ["redis"] },
  { name: "Express", aliases: ["express", "express.js"] },
  { name: "Next.js", aliases: ["next.js", "nextjs"] },
];

export function extractSkills(text) {
  return SKILL_CATALOG.filter((skill) => skill.aliases.some((a) => matchesAlias(text, a))).map(
    (skill) => skill.name
  );
}

/**
 * Compare a resume against a job description.
 *
 * The job description is read for real — the skills it asks for are genuinely
 * extracted from the text. What is mocked is the resume side: until pdf.js and
 * the AI step land, which skills the resume "contains" is decided by a seed, so
 * the same upload always yields the same result.
 */
export function analyzeResume({ resumeFileName, resumeSizeBytes, jobDescription }) {
  const required = extractSkills(jobDescription);
  if (required.length === 0) {
    return { ok: false, reason: "No recognizable skills found in the job description." };
  }

  const rand = mulberry32(hashString(`${resumeFileName}:${resumeSizeBytes}`));

  const present = [];
  const missing = [];
  for (const skill of required) {
    // Bias toward a plausible-but-imperfect match, so the score lands in a
    // range a learner will actually learn something from.
    const covered = rand() < 0.65;
    (covered ? present : missing).push(skill);
  }

  return {
    ok: true,
    score: Math.round((present.length / required.length) * 100),
    present,
    missing,
    requiredCount: required.length,
    engine: "mock",
  };
}

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Wraps an async route handler so a rejected promise reaches Express's error
// handler instead of turning into an unhandled rejection.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
