import mongoose from "mongoose";

// One document per analysis. We store the job description text so the
// comparison can be replayed once real AI parsing lands.
const analysisSchema = new mongoose.Schema(
  {
    resumeFileName: { type: String, required: true },
    resumeSizeBytes: { type: Number, required: true },
    jobDescription: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    present: { type: [String], default: [] },
    missing: { type: [String], default: [] },
    requiredCount: { type: Number, required: true },
    engine: { type: String, default: "mock" }, // "mock" today, "llm" later
  },
  { timestamps: true, bufferCommands: false }
);

export const Analysis = mongoose.model("Analysis", analysisSchema);
