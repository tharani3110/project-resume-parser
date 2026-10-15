import multer from "multer";
import { env } from "../config/env.js";

// Buffer the upload in memory — we only need the name/size today, and this
// keeps no temp files on disk. Swap for disk or S3 storage when the real
// PDF text extraction goes in.
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const isPdf =
    file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    // Tag it 400: this is the caller's mistake, not a server fault, and the
    // error handler reads `status` to decide the response code.
    const err = new Error("Resume must be a PDF.");
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
}

export const uploadResume = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes },
  fileFilter,
});
