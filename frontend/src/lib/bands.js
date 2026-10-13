// Presentation-only mapping from a score to its label and color.
// Kept on the client: the backend returns a number, the UI decides how it looks.

export function bandFor(score) {
  if (score >= 85) return { label: "Shipped-ready", color: "#34d399" };
  if (score >= 70) return { label: "Strong candidate", color: "#34d399" };
  if (score >= 50) return { label: "Getting there", color: "#fbbf24" };
  return { label: "Needs work", color: "#f87171" };
}
