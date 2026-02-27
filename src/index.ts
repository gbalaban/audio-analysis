import express from "express";
import cors from "cors";
import { z } from "zod";
import { analyzeAudio, AnalysisError } from "./analyze";

const app = express();
const PORT = process.env.PORT ?? 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

const AnalyzeSchema = z.object({
  previewUrl: z.string().url(),
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.post("/analyze", async (req, res) => {
  const parsed = AnalyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0].message,
      code: "VALIDATION_ERROR",
    });
    return;
  }

  try {
    const result = await analyzeAudio(parsed.data.previewUrl);
    res.json(result);
  } catch (err) {
    if (err instanceof AnalysisError) {
      const status = err.code === "INVALID_URL" ? 400 : 500;
      res.status(status).json({ error: err.message, code: err.code });
      return;
    }
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR" });
  }
});

app.listen(PORT, () => {
  console.log(`Audio analysis service listening on port ${PORT}`);
});
