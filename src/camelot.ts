// Camelot Wheel mapping: musical key + scale → Camelot notation
// https://mixedinkey.com/camelot-wheel/

const CAMELOT_MAP: Record<string, string> = {
  // Minor keys → A side
  "Ab minor": "1A",
  "G# minor": "1A",
  "Eb minor": "2A",
  "D# minor": "2A",
  "Bb minor": "3A",
  "A# minor": "3A",
  "F minor": "4A",
  "C minor": "5A",
  "G minor": "6A",
  "D minor": "7A",
  "A minor": "8A",
  "E minor": "9A",
  "B minor": "10A",
  "F# minor": "11A",
  "Gb minor": "11A",
  "Db minor": "12A",
  "C# minor": "12A",

  // Major keys → B side
  "B major": "1B",
  "Cb major": "1B",
  "F# major": "2B",
  "Gb major": "2B",
  "Db major": "3B",
  "C# major": "3B",
  "Ab major": "4B",
  "G# major": "4B",
  "Eb major": "5B",
  "D# major": "5B",
  "Bb major": "6B",
  "A# major": "6B",
  "F major": "7B",
  "C major": "8B",
  "G major": "9B",
  "D major": "10B",
  "A major": "11B",
  "E major": "12B",
};

export function toCamelot(key: string, scale: string): string {
  const lookup = `${key} ${scale}`;
  return CAMELOT_MAP[lookup] ?? "Unknown";
}
