import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load backend/.env explicitly. `import "dotenv/config"` reads from the
// current working directory, so starting the server from anywhere else
// (or a script in a subfolder) would silently miss the file.
//
// On Vercel there is no .env file — the values come from the project's
// Environment Variables, which dotenv simply leaves alone.
const here = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(here, "..", ".env") });

// CLIENT_ORIGIN accepts a comma-separated list, because in production the
// frontend lives on its own domain (and on preview deployments, several).
const origins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, "")) // drop any trailing slash
  .filter(Boolean);

export const allowedOrigins = origins;

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/resume_parser",
  allowedOrigins,
  maxUploadBytes: 5 * 1024 * 1024, // 5 MB
};
