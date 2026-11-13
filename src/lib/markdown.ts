/**
 * A small Markdown reader for Learn pages: ## and ### headings, paragraphs, "- " lists, pipe tables, **bold**,
 * *italic*, links ([text](learn:cases), [text](drill:cases), [text](https://…)), and data blocks:
 *   ::forms <kind> <words…>   a table of forms made by the rules (kinds: plural, cases, possessive, copula, present,
 *                             presentNeg, past, pastNeg, pronouns, numbers, alphabet, question)
 *   ::drill <mode>            a "Practise this" button
 * Kazakh (Cyrillic) words are shown in the reader's chosen script.
 */
import { href } from './router.ts';
import { toLatin, type Script } from '../shared/script.ts';

export type Block =
  | { type: 'h2' | 'h3' | 'p'; html: string }
  | { type: 'ul'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'forms'; kind: string; words: string[] }
  | { type: 'drill'; mode: string };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const KK = /[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+(?:[-‑][А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+)*/g;

/** Kazakh words in the reader's script. */
export function kkText(s: string, script: Script): string {
  return s.replace(KK, (w) => {
    if (script === 'cyrl') return `<span lang="kk">${w}</span>`;
    if (script === 'latn') return `<span lang="kk-Latn">${toLatin(w)}</span>`;
    return `<span lang="kk">${w}</span> <span class="lat" lang="kk-Latn">${toLatin(w)}</span>`;
  });
}

export function inline(s: string, script: Script): string {
  let h = esc(s);
  const links: string[] = [];
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text: string, url: string) => {
    const m = /^(learn|drill|vocabulary):(.+)$/.exec(url);
    const target = m ? href(m[1] === 'learn' ? { page: 'learn', topic: m[2] } : m[1] === 'drill' ? { page: 'drill', mode: m[2] } : { page: 'vocabulary', theme: m[2] }) : url;
    links.push(`<a href="${target}"${m ? '' : ' rel="noopener" target="_blank"'}>${kkText(text, script)}</a>`);
    return `\u0000${links.length - 1}\u0000`;
  });
  h = kkText(h, script);
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  return h.replace(/\u0000(\d+)\u0000/g, (_, i: string) => links[Number(i)]!);
}

export function parse(md: string, script: Script): { title: string; blocks: Block[] } {
  const lines = md.replace(/\r/g, '').split('\n');
  let title = '';
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ type: 'p', html: inline(para.join(' '), script) });
    para = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    if (line.startsWith('# ')) {
      flush();
      title = line.slice(2);
    } else if (line.startsWith('### ')) {
      flush();
      blocks.push({ type: 'h3', html: inline(line.slice(4), script) });
    } else if (line.startsWith('## ')) {
      flush();
      blocks.push({ type: 'h2', html: inline(line.slice(3), script) });
    } else if (line.startsWith('::forms ')) {
      flush();
      const [kind, ...words] = line.slice(8).trim().split(/\s+/);
      blocks.push({ type: 'forms', kind: kind!, words: words.map((w) => w.replace(/_/g, ' ')) });
    } else if (line.startsWith('::drill ')) {
      flush();
      blocks.push({ type: 'drill', mode: line.slice(8).trim() });
    } else if (line.startsWith('- ')) {
      flush();
      const items: string[] = [];
      while (i < lines.length && lines[i]!.startsWith('- ')) items.push(inline(lines[i++]!.slice(2), script));
      i--;
      blocks.push({ type: 'ul', items });
    } else if (line.startsWith('|')) {
      flush();
      const rows: string[][] = [];
      while (i < lines.length && lines[i]!.startsWith('|')) {
        const cells = lines[i++]!.split('|').slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells.map((c) => inline(c, script)));
      }
      i--;
      blocks.push({ type: 'table', head: rows[0] ?? [], rows: rows.slice(1) });
    } else para.push(line.trim());
  }
  flush();
  return { title, blocks };
}
