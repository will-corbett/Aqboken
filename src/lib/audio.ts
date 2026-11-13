/** Where a Kazakh text's audio is: a native recording (credited) if there is one, else the computer voice. */
import recordings from '../data/recordings.json';
import { audioKey, speakable } from '../shared/audio.ts';

export interface Recording {
  file: string;
  author: string;
  licence: string;
  licenceUrl: string;
  page: string;
}
export const RECORDINGS = recordings as Record<string, Recording>;

export interface AudioSource {
  url: string;
  native?: Recording;
}
export function audioFor(text: string): AudioSource {
  const t = speakable(text);
  const native = RECORDINGS[t] ?? RECORDINGS[t.toLowerCase()];
  return native ? { url: `${import.meta.env.BASE_URL}audio/native/${native.file}`, native } : { url: `${import.meta.env.BASE_URL}audio/tts/${audioKey(t)}.mp3` };
}
