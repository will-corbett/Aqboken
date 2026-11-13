/**
 * Native recordings: for every word in our lists, a recording of exactly that word from Wikimedia Commons (Lingua
 * Libre's Kazakh recordings, and Category:Kazakh pronunciation). Only CC0, CC BY, CC BY-SA or public domain; each is
 * credited (author, licence, file page) beside it when it plays and on the About page. The MP3s go in
 * public/audio/native/ and their credits in src/data/recordings.json, both committed (there are few, and they don't
 * change). Run by hand: `npm run audio:native`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { ALL_WORDS } from '../src/data/words.ts';
import { audioKey } from '../src/shared/audio.ts';

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'Korti-build/0.1 (Kazakh learning site; https://github.com/will-corbett/Korti)';
const CATEGORIES = ['Category:Lingua Libre pronunciation-kaz', 'Category:Kazakh pronunciation'];
const OK_LICENCE = /^(CC0|CC BY(-SA)? [0-9.]+|Public domain)/i;

async function api(params: Record<string, string>): Promise<any> {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

/** The word a file records: "File:LL-Q9252 (kaz)-Nurken-кітап.wav" → "кітап". Variants in brackets are skipped. */
function wordOf(title: string): string | undefined {
  const name = title.replace(/^File:/, '').replace(/\.(wav|ogg|oga|mp3|flac)$/i, '');
  if (/\(.*\)\s*$/.test(name) && !/^LL-/.test(name)) return undefined;
  const w = name.replace(/^LL-Q9252 \(kaz\)-[^-]+-/, '').replace(/^(Kk-|Kazakh word |Pronunciation kk )/i, '').trim();
  return /[()]/.test(w) ? undefined : w.toLowerCase();
}

const titles: string[] = [];
for (const cmtitle of CATEGORIES) {
  let cont: Record<string, string> = {};
  do {
    const d = await api({ action: 'query', list: 'categorymembers', cmtitle, cmtype: 'file', cmlimit: '500', ...cont });
    titles.push(...d.query.categorymembers.map((m: { title: string }) => m.title));
    cont = d.continue ?? {};
  } while (Object.keys(cont).length);
}

const ours = new Set(ALL_WORDS.map((w) => w.kk));
const byWord = new Map<string, string>();
for (const t of titles.sort()) {
  const w = wordOf(t);
  if (w && ours.has(w) && !byWord.has(w)) byWord.set(w, t);
}

interface Recording {
  file: string;
  author: string;
  licence: string;
  licenceUrl: string;
  page: string;
}
// Keep what an earlier run saved (Commons rate-limits downloads, so a run may stop part-way).
const out: Record<string, Recording> = existsSync('src/data/recordings.json') ? JSON.parse(readFileSync('src/data/recordings.json', 'utf8')) : {};
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
/** Fetch, waiting and trying again (up to 6 times, longer each time) when rate-limited. */
async function get(url: string): Promise<Response> {
  for (let i = 0; ; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.status !== 429 || i >= 5) return r;
    await sleep(Number(r.headers.get('retry-after')) * 1000 || 5000 * 2 ** i);
  }
}
const skipped: string[] = [];
mkdirSync('public/audio/native', { recursive: true });
for (const [word, title] of [...byWord].sort()) {
  if (out[word] && existsSync(`public/audio/native/${out[word].file}`)) continue;
  const d = await api({ action: 'query', titles: title, prop: 'imageinfo|videoinfo', iiprop: 'extmetadata|url', viprop: 'derivatives' });
  const page = d.query.pages[0];
  const meta = page.imageinfo?.[0]?.extmetadata ?? {};
  const licence: string = meta.LicenseShortName?.value ?? '';
  if (!OK_LICENCE.test(licence)) {
    skipped.push(`${word}: ${title} (${licence || 'no licence'})`);
    continue;
  }
  const mp3 = (page.videoinfo?.[0]?.derivatives ?? []).find((x: { type: string }) => x.type.startsWith('audio/mpeg'))?.src;
  if (!mp3) {
    skipped.push(`${word}: ${title} (no MP3 version)`);
    continue;
  }
  const r = await get(mp3);
  if (!r.ok) {
    skipped.push(`${word}: ${title} (download ${r.status})`);
    continue;
  }
  const file = `${audioKey(word)}.mp3`;
  writeFileSync(`public/audio/native/${file}`, Buffer.from(await r.arrayBuffer()));
  // Lingua Libre's "Speaker: X Recorder: Y": credit the speaker.
  const artist = String(meta.Artist?.value ?? 'unknown').replace(/<[^>]+>/g, '').trim();
  const author = /Speaker:\s*([^\n]+)/.exec(artist)?.[1]?.trim() ?? artist;
  out[word] = { file, author, licence, licenceUrl: meta.LicenseUrl?.value ?? '', page: page.imageinfo?.[0]?.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}` };
  await sleep(2000);
}
writeFileSync('src/data/recordings.json', JSON.stringify(Object.fromEntries(Object.entries(out).sort()), null, 2) + '\n');
console.log(`${titles.length} files on Commons; ${Object.keys(out).length} recordings saved.${skipped.length ? `\nSkipped:\n  ${skipped.join('\n  ')}` : ''}`);
