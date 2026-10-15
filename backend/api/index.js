import app from "../app.js";
import { env } from "../config/env.js";
import { connectDb } from "../config/db.js";

// Vercel's entry point. Every path is rewritten here by vercel.json, so this
// one function serves the whole API.
//
// Serverless containers are reused while warm and Mongoose caches its
// connection globally, so connectDb runs once per container rather than once
// per request. It is not awaited: the API answers requests either way, and a
// database that is down costs a saved document, not the analysis itself.
connectDb(env.mongoUri).catch((err) => {
  console.warn(
    `[db] not connected (${err.message}). The API still works; analyses just won't be saved.`
  );
});

export default app;
