/**
 * Audio file names, shared by the build (scripts/audio-texts.ts) and the app: each computer-voice file is named after
 * a 64-bit hash of its text (two FNV-1a passes), so the app finds it without loading a list. Bump VOICE when the
 * voice or its settings change: every file is then made again.
 */
export const VOICE = 'issai-high-s4-v1';

function fnv(s: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** The text as it is voiced: NFC, single spaces, trimmed. */
export const speakable = (text: string) => text.normalize('NFC').replace(/\s+/g, ' ').trim();

export function audioKey(text: string): string {
  const t = `${VOICE}|${speakable(text)}`;
  return fnv(t, 0x811c9dc5).toString(16).padStart(8, '0') + fnv(t, 0x050c5d1f).toString(16).padStart(8, '0');
}
