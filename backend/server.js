import app from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";

// Local development entry point. Vercel does not use this file — it calls
// api/index.js instead — but `npm run dev` here gives you the same app on a
// port, with the connection failure logged rather than thrown.
app.listen(env.port, () => {
  console.log(`[api] listening on http://localhost:${env.port}`);
  console.log(`[api] allowing origins: ${env.allowedOrigins.join(", ")}`);
});

// Not awaited: the server is useful without the database, so a missing
// MongoDB (not installed, not running, wrong URI) is a warning, not a stop.
connectDb(env.mongoUri).catch((err) => {
  console.warn(
    `[db] not connected (${err.message}). The API still works; analyses just won't be saved.`
  );
});
