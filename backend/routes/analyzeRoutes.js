import { Router } from "express";
import { uploadResume } from "../middleware/upload.js";
import { analyzeResumeHandler, listAnalysesHandler } from "../controller/analyzeController.js";

const router = Router();

// Multer runs first; if it rejects the file it calls next(err) and the
// central error handler answers, so the controller only sees valid uploads.
router.post("/analyze", uploadResume.single("resume"), analyzeResumeHandler);
router.get("/analyses", listAnalysesHandler);

export default router;
