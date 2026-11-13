/**
 * Scripts. Kazakh is written in Cyrillic today; the Latin alphabet of April 2021 is to replace it gradually. Aqböken
 * shows Cyrillic, Latin or both (settings.script) and accepts answers typed in either.
 *
 * The 2021 alphabet gives Latin letters for the Kazakh letters (Ә → Ä, Ғ → Ğ, Қ → Q, Ң → Ñ, Ө → Ö, Ұ → Ū, Ү → Ü,
 * Һ/Х → H, І → I ı, И/Й → İ i, Ы → Y, Ш → Ş, Ж → J, У → U). Letters used only in Russian loanwords (ё ц ч щ э ю я
 * ъ ь) have no letter of their own; we write them as their sounds (ts, ch, şş, e, iu, ia, io), which is an
 * approximation, and say so on the alphabet page.
 */

const MAP: Record<string, string> = {
  а: 'a', ә: 'ä', б: 'b', в: 'v', г: 'g', ғ: 'ğ', д: 'd', е: 'e', ё: 'io', ж: 'j', з: 'z', и: 'i', й: 'i', к: 'k',
  қ: 'q', л: 'l', м: 'm', н: 'n', ң: 'ñ', о: 'o', ө: 'ö', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ұ: 'ū', ү: 'ü',
  ф: 'f', х: 'h', һ: 'h', ц: 'ts', ч: 'ch', ш: 'ş', щ: 'şş', ъ: '', ы: 'y', і: 'ı', ь: '', э: 'e', ю: 'iu', я: 'ia',
};
const UPPER: Record<string, string> = { і: 'I', и: 'İ', й: 'İ', ё: 'İo', ю: 'İu', я: 'İa' };

/** Letters whose Latin spelling is our approximation, not a letter of the 2021 alphabet. */
export const APPROXIMATE = new Set(['ё', 'ц', 'ч', 'щ', 'ъ', 'ь', 'э', 'ю', 'я']);

export function toLatin(text: string): string {
  let out = '';
  for (const ch of text.normalize('NFC')) {
    const lower = ch.toLowerCase();
    const m = MAP[lower];
    if (m === undefined) {
      out += ch;
      continue;
    }
    if (ch !== lower) out += UPPER[lower] ?? (m.charAt(0).toUpperCase() + m.slice(1));
    else out += m;
  }
  return out;
}

/** Lower-case Latin the Kazakh way: I → ı, İ → i (JavaScript's toLowerCase turns both into i). */
function latinLower(s: string): string {
  return s.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();
}

const LATIN = /[a-zäğıñöşūü]/i;

/** Answer comparison: NFC, lower case, spaces collapsed; Latin input is compared with the answer in Latin. */
export function normalise(input: string): string {
  return input.normalize('NFC').replace(/[\s?!.,]+$/, '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function sameAnswer(input: string, answer: string): boolean {
  const i = input.normalize('NFC').replace(/[\s?!.,]+$/, '').trim().replace(/\s+/g, ' ');
  if (!i) return false;
  if (LATIN.test(i) && !/[а-яәғқңөұүһі]/i.test(i)) return latinLower(i) === latinLower(toLatin(answer.normalize('NFC').replace(/[\s?!.,]+$/, '').trim().replace(/\s+/g, ' ')));
  return normalise(i) === normalise(answer);
}

export type Script = 'cyrl' | 'latn' | 'both';
