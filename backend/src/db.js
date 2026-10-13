import mongoose from "mongoose";

// Connecting is separate from starting the server on purpose: the API can
// serve a request even when the database is down, and we want that to be a
// logged warning rather than a crash. See server.js.
export async function connectDb(uri) {
  // Fail immediately instead of buffering operations for 10s when the database
  // is unreachable — a fast error is far easier to debug.
  mongoose.set("bufferCommands", false);

  mongoose.connection.on("error", (err) => {
    console.error("[db] connection error:", err.message);
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 3000, // fail fast instead of hanging the boot
  });

  console.log("[db] connected to MongoDB");
}
