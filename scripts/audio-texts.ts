/**
 * Lists every Kazakh text the site can play in the computer voice: each vocabulary word, and the spoken answer of
 * every question every drill can ask (under the widest settings), and every example sentence. Writes audio-tts/wanted.tsv (key, text), which
 * scripts/tts.py voices; words with a native recording (src/data/recordings.json) are left out.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { pool, speakText } from '../src/lib/questions.ts';
import { defaults, type Settings } from '../src/lib/settings.ts';
import { mulberry32 } from '../src/lib/rng.ts';
import { TOPICS } from '../src/lib/topics.ts';
import { ALL_WORDS } from '../src/data/words.ts';
import { CASES, PERSONS, POSS_PERSONS } from '../src/shared/kazakh.ts';
import { audioKey, speakable } from '../src/shared/audio.ts';
import recordings from '../src/data/recordings.json' with { type: 'json' };
import sentences from '../src/data/sentences.json' with { type: 'json' };

const native = new Set(Object.keys(recordings));
const texts = new Set<string>(ALL_WORDS.map((w) => speakable(w.kk)));
// Example sentences (Tatoeba).
for (const row of Object.values(sentences) as [number, string][]) texts.add(speakable(row[1]));
const wide = (): Settings => {
  const s = defaults();
  s.cases = { cases: CASES.filter((c) => c !== 'nom'), number: 'both' };
  s.possessive.persons = [...POSS_PERSONS];
  s.copula.persons = [...PERSONS];
  s.present = { persons: [...PERSONS], polarity: 'both' };
  s.past = { persons: [...PERSONS], polarity: 'both' };
  s.vocab = { direction: 'recall', themes: [], source: 'themes' };
  return s;
};
for (const t of TOPICS) {
  const variants: Settings[] = t.id === 'numbers' ? (['to10', 'to100', 'to1000', 'years'] as const).map((r) => ({ ...wide(), numbers: { range: r, direction: 'write' } })) : [wide()];
  for (const s of variants) for (const q of pool(t.id, s, mulberry32(1))) {
    const say = speakText(q);
    if (say) texts.add(speakable(say));
  }
}
const wanted = [...texts].filter((t) => !native.has(t)).sort();
mkdirSync('audio-tts', { recursive: true });
writeFileSync('audio-tts/wanted.tsv', wanted.map((t) => `${audioKey(t)}\t${t}`).join('\n') + '\n');
console.log(`${wanted.length} texts for the computer voice (${texts.size - wanted.length} have a native recording).`);
