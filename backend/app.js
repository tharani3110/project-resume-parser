import express from "express";
import cors from "cors";
import { allowedOrigins } from "./config/env.js";
import { isDbConnected } from "./config/db.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// The Express app — no server attached, no database connection made here.
// That separation is what lets the same code run two ways:
//   - `server.js`  listens on a port, for local development
//   - `api/index.js` is exported as a Vercel serverless function
// A file that calls app.listen() cannot be a serverless function, which is
// why this is split out.
export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, cb) {
        // Requests from curl, Postman or another server have no Origin header.
        // Allow those, plus anything in the configured list.
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(null, false); // no CORS headers -> the browser blocks the response
      },
    })
  );

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, db: isDbConnected() ? "connected" : "disconnected" });
  });

  app.use("/api", routes);

  // Order matters: 404 first, then the error handler, both last.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp();
