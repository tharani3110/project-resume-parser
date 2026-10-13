// Mock analysis engine. This is the boundary that the AI step will replace:
// everything else (routes, storage, the UI) already treats it as a black box
// that takes a resume + job description and returns a score and skill lists.

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

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Word-boundary matching, so "js" doesn't light up inside "json" or
// "react" inside "reactive". This is the whole trick to keyword extraction.
function hasAlias(text, alias) {
  const pattern = new RegExp(`(?<![a-z0-9.])${escapeRegex(alias)}(?![a-z0-9])`, "i");
  return pattern.test(text);
}

export function extractSkills(text) {
  return SKILL_CATALOG.filter((skill) => skill.aliases.some((a) => hasAlias(text, a))).map(
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
export function analyze({ resumeFileName, resumeSizeBytes, jobDescription }) {
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

  const score = Math.round((present.length / required.length) * 100);

  return {
    ok: true,
    score,
    present,
    missing,
    requiredCount: required.length,
    engine: "mock",
  };
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
