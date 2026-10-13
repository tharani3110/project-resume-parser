import "dotenv/config";
import express from "express";
import cors from "cors";
import analyzeRoutes from "./src/routes/analyze.js";
import { connectDb } from "./src/db.js";

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, db: app.locals.dbConnected ? "connected" : "disconnected" });
});

app.use("/api", analyzeRoutes);

app.use((err, req, res, next) => {
  console.error("[error]", err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});

// Not awaited: the server is useful without the database, so a missing
// MongoDB (not installed, not running, wrong URI) is a warning, not a stop.
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/resume_parser";
connectDb(mongoUri)
  .then(() => {
    app.locals.dbConnected = true;
  })
  .catch((err) => {
    app.locals.dbConnected = false;
    console.warn(
      `[db] not connected (${err.message}). The API still works; analyses just won't be saved.`
    );
  });
