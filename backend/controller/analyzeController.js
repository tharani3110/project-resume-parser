import { Analysis } from "../models/Analysis.js";
import { analyzeResume, asyncHandler } from "../utils.js";
import { isDbConnected } from "../config/db.js";

const MIN_JD_LENGTH = 30;

// POST /api/analyze — multipart form with `resume` (PDF) and `jobDescription`.
export const analyzeResumeHandler = asyncHandler(async (req, res) => {
  const { jobDescription } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No resume file was uploaded." });
  }
  if (!jobDescription || jobDescription.trim().length < MIN_JD_LENGTH) {
    return res.status(400).json({
      error: `Paste a job description (at least ${MIN_JD_LENGTH} characters) to compare against.`,
    });
  }

  const outcome = analyzeResume({
    resumeFileName: req.file.originalname,
    resumeSizeBytes: req.file.size,
    jobDescription,
  });

  if (!outcome.ok) return res.status(422).json({ error: outcome.reason });

  // Saving is best-effort: a database outage shouldn't cost the learner their
  // analysis result. Checking first avoids a guaranteed-failed write — with
  // bufferCommands off, attempting it on a down database throws every time.
  if (isDbConnected()) {
    try {
      await Analysis.create({
        resumeFileName: req.file.originalname,
        resumeSizeBytes: req.file.size,
        jobDescription,
        score: outcome.score,
        present: outcome.present,
        missing: outcome.missing,
        requiredCount: outcome.requiredCount,
        engine: outcome.engine,
      });
    } catch (dbErr) {
      console.error("[db] could not save analysis:", dbErr.message);
    }
  } else {
    console.warn("[db] skipping save: database not connected");
  }

  res.json({
    score: outcome.score,
    present: outcome.present,
    missing: outcome.missing,
    requiredCount: outcome.requiredCount,
    engine: outcome.engine,
  });
});

// GET /api/analyses — recent analyses, newest first.
export const listAnalysesHandler = asyncHandler(async (req, res) => {
  // A read has nothing useful to fall back on, so say plainly that the
  // database is missing rather than letting the generic handler return a 500.
  if (!isDbConnected()) {
    return res.status(503).json({ error: "Database is not connected." });
  }

  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const rows = await Analysis.find().sort({ createdAt: -1 }).limit(limit).lean();
  res.json(rows);
});
