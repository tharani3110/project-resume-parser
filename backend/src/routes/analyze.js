import { Router } from "express";
import multer from "multer";
import { Analysis } from "../models/Analysis.js";
import { analyze } from "../lib/analysis.js";

const router = Router();

// Buffer the upload in memory — we only need the name/size today, and this
// keeps no temp files on disk. Swap for disk or S3 storage when the real
// PDF text extraction goes in.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
    if (!isPdf) return cb(new Error("Resume must be a PDF."));
    cb(null, true);
  },
});

router.post("/analyze", (req, res) => {
  upload.single("resume")(req, res, async (uploadErr) => {
    if (uploadErr) {
      const message =
        uploadErr.code === "LIMIT_FILE_SIZE" ? "PDF is larger than 5 MB." : uploadErr.message;
      return res.status(400).json({ error: message });
    }

    const { jobDescription } = req.body;
    if (!req.file) return res.status(400).json({ error: "No resume file was uploaded." });
    if (!jobDescription || jobDescription.trim().length < 30) {
      return res
        .status(400)
        .json({ error: "Paste a job description (at least 30 characters) to compare against." });
    }

    const outcome = analyze({
      resumeFileName: req.file.originalname,
      resumeSizeBytes: req.file.size,
      jobDescription,
    });

    if (!outcome.ok) return res.status(422).json({ error: outcome.reason });

    // Saving is best-effort: a database outage shouldn't cost the learner
    // their analysis result.
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

    res.json({
      score: outcome.score,
      present: outcome.present,
      missing: outcome.missing,
      requiredCount: outcome.requiredCount,
      engine: outcome.engine,
    });
  });
});

// Simple read-back endpoint so the stored documents are visible while building.
router.get("/analyses", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  try {
    const rows = await Analysis.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json(rows);
  } catch (err) {
    res.status(503).json({ error: `Could not read analyses: ${err.message}` });
  }
});

export default router;
