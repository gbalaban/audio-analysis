import { execFileSync } from "child_process";
import { toCamelot } from "./camelot";

// essentia.js ships UMD bundles — use require for Node.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Essentia, EssentiaWASM } = require("essentia.js");

const essentia = new Essentia(EssentiaWASM);

export interface AnalysisResult {
  bpm: number;
  key: string;
  camelotKey: string;
  confidence: number;
}

export class AnalysisError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

const DEEZER_PREVIEW_RE =
  /^https:\/\/cdn[st]-preview(-[a-z0-9])?\.dzcdn\.net\//;

function validateDeezerUrl(url: string): void {
  if (!DEEZER_PREVIEW_RE.test(url)) {
    throw new AnalysisError(
      "URL must be a Deezer preview (cdn*-preview*.dzcdn.net)",
      "INVALID_URL",
    );
  }
}

async function downloadMp3(url: string, maxSizeMb: number): Promise<Buffer> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    throw new AnalysisError(`Failed to download preview: ${msg}`, "DOWNLOAD_FAILED");
  }

  if (!res.ok) {
    throw new AnalysisError(
      `Failed to download preview: ${res.status} ${res.statusText}`,
      "DOWNLOAD_FAILED",
    );
  }

  const contentLength = Number(res.headers.get("content-length") ?? 0);
  if (contentLength > maxSizeMb * 1024 * 1024) {
    throw new AnalysisError(
      `File exceeds ${maxSizeMb}MB limit`,
      "DOWNLOAD_FAILED",
    );
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

function decodeMp3(mp3Buffer: Buffer): Float32Array {
  try {
    const raw = execFileSync("ffmpeg", [
      "-i", "pipe:0",
      "-f", "f32le",
      "-acodec", "pcm_f32le",
      "-ac", "1",
      "-ar", "44100",
      "-loglevel", "error",
      "pipe:1",
    ], {
      input: mp3Buffer,
      maxBuffer: 50 * 1024 * 1024,
    });

    return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  } catch {
    throw new AnalysisError("Failed to decode audio", "DECODE_FAILED");
  }
}

export async function analyzeAudio(previewUrl: string): Promise<AnalysisResult> {
  const maxSizeMb = Number(process.env.MAX_AUDIO_SIZE_MB ?? 10);

  validateDeezerUrl(previewUrl);

  const mp3Buffer = await downloadMp3(previewUrl, maxSizeMb);
  const samples = decodeMp3(mp3Buffer);
  const signal = essentia.arrayToVector(samples);

  try {
    const bpmResult = essentia.PercivalBpmEstimator(signal);
    const bpm = Math.round(bpmResult.bpm);

    const keyResult = essentia.KeyExtractor(signal);
    const key = `${keyResult.key} ${keyResult.scale}`;
    const camelotKey = toCamelot(keyResult.key, keyResult.scale);
    const confidence = Math.round(keyResult.strength * 1000) / 1000;

    return { bpm, key, camelotKey, confidence };
  } catch {
    throw new AnalysisError("Audio analysis failed", "ANALYSIS_FAILED");
  }
}
