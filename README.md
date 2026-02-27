# Audio Analysis Service

Audio analysis microservice for **SpinMixPro**. Detects BPM and musical key from Deezer 30-second preview URLs using [Essentia.js](https://essentia.upf.edu/essentiajs/) (WASM).

## API

### `POST /analyze`

Accepts a Deezer preview URL and returns BPM, key, and Camelot notation.

**Request:**

```json
{ "previewUrl": "https://cdns-preview-e.dzcdn.net/stream/..." }
```

**Response:**

```json
{
  "bpm": 124,
  "key": "A minor",
  "camelotKey": "8A",
  "confidence": 0.782
}
```

### `GET /health`

Returns service status and uptime.

```json
{ "status": "ok", "uptime": 123.456 }
```

## Run locally

Requires Node.js 20+ and ffmpeg installed.

```bash
npm install
npm run dev
```

## Docker

```bash
docker build -t audio-analysis .
docker run -p 3001:3001 audio-analysis
```

## License

AGPL-3.0 — see [LICENSE](LICENSE).
