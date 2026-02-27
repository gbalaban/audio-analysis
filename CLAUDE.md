# SpinMixPro Audio Analysis Service

Standalone AGPL-licensed microservice that analyzes audio files for BPM and musical key detection using Essentia.js (WASM).

**⚠️ LEGAL: This repo is AGPL-3.0 and public on GitHub. It must NEVER import, reference, or depend on any SpinMixPro proprietary code. Communication with SpinMixPro is via HTTP API only.**

---

## Stack

- Node.js 20, TypeScript, Express
- Essentia.js (WASM) for BPM + key detection
- ffmpeg for MP3 → PCM decoding
- Zod for request validation
- Docker for deployment

## Commands

- `npm run dev` — start dev server with tsx (port 3001)
- `npm run build` — compile TypeScript
- `npm start` — run compiled JS
- `npm test` — run tests
- `docker build -t audio-analysis .` — build Docker image
- `docker run -p 3001:3001 audio-analysis` — run Docker container

## Architecture

- `src/index.ts` — Express server (port 3001), `/analyze` and `/health` endpoints
- `src/analyze.ts` — downloads MP3, decodes via ffmpeg, runs Essentia.js algorithms
- `src/camelot.ts` — maps musical key + scale to Camelot wheel notation

## API Endpoints

### POST /analyze
```json
// Request
{ "previewUrl": "https://cdns-preview-X.dzcdn.net/stream/..." }

// Response (success)
{
  "bpm": 128,
  "key": "B minor",
  "camelotKey": "10A",
  "confidence": 0.85
}

// Response (error)
{
  "error": "Failed to download preview",
  "code": "DOWNLOAD_FAILED"
}
```

### GET /health
```json
{ "status": "ok", "uptime": 12345 }
```

## Key Details

- Audio is decoded to mono Float32 at 44100 Hz (required by Essentia)
- Uses `PercivalBpmEstimator` for BPM, `KeyExtractor` for key
- BPM is rounded to nearest integer
- Confidence is from Essentia's key detection strength (0-1)
- No database, no auth — stateless audio-in → analysis-out
- Accepts only Deezer preview URLs (cdns-preview-*.dzcdn.net)

## Camelot Wheel Mapping

| Key | Camelot | Key | Camelot |
|-----|---------|-----|---------|
| C major | 8B | A minor | 8A |
| G major | 9B | E minor | 9A |
| D major | 10B | B minor | 10A |
| A major | 11B | F# minor | 11A |
| E major | 12B | C# minor | 12A |
| B major | 1B | G# minor | 1A |
| F# major | 2B | D# minor | 2A |
| Db major | 3B | Bb minor | 3A |
| Ab major | 4B | F minor | 4A |
| Eb major | 5B | C minor | 5A |
| Bb major | 6B | G minor | 6A |
| F major | 7B | D minor | 7A |

## Environment Variables

```
PORT=3001              # Server port (default: 3001)
CORS_ORIGIN=*          # Allowed CORS origin (default: * for dev, set to your domain in prod)
MAX_AUDIO_SIZE_MB=10   # Max download size (default: 10)
```

## Deployment

Deploy separately from SpinMixPro main app. Options:
- Railway (free tier)
- Fly.io (free tier)
- Any Docker host

SpinMixPro connects via `ESSENTIA_SERVICE_URL=https://your-deployed-url.com`

## Coding Conventions

- All TypeScript, no .js files except config
- Zod validation on all request bodies
- try/catch on all async operations
- Error responses: `{ error: string, code: string }`
- kebab-case files, camelCase functions, PascalCase types
