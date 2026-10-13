// Every call to the backend goes through here, so the components never
// deal with fetch, headers, or error shapes themselves.

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function analyzeResume(resumeFile, jobDescription) {
  const form = new FormData();
  form.append("resume", resumeFile);
  form.append("jobDescription", jobDescription);

  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: form, // multipart/form-data — the browser sets the boundary itself
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Analysis failed (HTTP ${res.status})`);
  }
  return res.json();
}

export async function fetchHistory(limit = 10) {
  const res = await fetch(`${API_BASE}/analyses?limit=${limit}`);
  if (!res.ok) throw new Error(`Could not load history (HTTP ${res.status})`);
  return res.json();
}
