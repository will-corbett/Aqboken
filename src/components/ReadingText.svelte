<script lang="ts">
  import { AUTHOR, textById } from '../data/reading.ts';
  import { ALL_WORDS, type Word } from '../data/words.ts';
  import { loadReading, SOURCE_NAME, type ReadingData } from '../lib/reading.ts';
  import { href } from '../lib/router.ts';
  import type { MyWords } from '../lib/mywords.ts';
  import { toLatin, type Script } from '../shared/script.ts';
  import Hear from './Hear.svelte';
  import Kz from './Kz.svelte';

  let { id, script, progressOn, myWords, onadd, onpractise }: { id: string; script: Script; progressOn: boolean; myWords: MyWords; onadd: (w: string[]) => void; onpractise: (words: Word[], d: 'recognise' | 'recall') => void } = $props();
  const def = $derived(textById(id));
  let data = $state<ReadingData | null>(null);
  let failed = $state(false);
  let sel = $state<number | null>(null);
  let pinned = $state(false);
  let answers = $state<(number | undefined)[]>([]);
  const wordEls: HTMLButtonElement[] = [];

  $effect(() => {
    data = null;
    failed = false;
    sel = null;
    answers = [];
    const p = loadReading(id);
    if (!p) failed = true;
    else p.then((d) => (data = d)).catch(() => (failed = true));
  });

  const sc = (t: string) => (script === 'latn' ? toLatin(t) : t);
  const w = $derived(data && sel !== null ? data.words[sel] : undefined);
  const ourWords = $derived(data ? [...new Set(data.words.filter((x) => x.ours).map((x) => x.lemma))].map((l) => ALL_WORDS.find((a) => a.kk === l)).filter((x): x is Word => !!x) : []);
  const notMine = $derived(ourWords.filter((x) => !myWords[x.kk]));

  function choose(i: number, pin = false) {
    sel = i;
    if (pin) pinned = true;
  }
  function onKey(e: KeyboardEvent, i: number) {
    if (!data) return;
    const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
    if (n === null || n < 0 || n >= data.words.length) return;
    e.preventDefault();
    sel = n;
    pinned = true;
    wordEls[n]?.focus();
  }
</script>

{#if !def || failed}
  <p>No text called “{id}”. <a href={href({ page: 'reading' })}>All texts</a></p>
{:else}
  <p class="crumbs"><a href={href({ page: 'reading' })}>Reading</a> · <span class="chip">{def.level}</span></p>
  <h1><Kz text={def.title} {script} /> <span class="en-title">{def.en}</span></h1>
  <p class="muted">{def.blurb}</p>

  {#if !data}
    <p class="muted">Loading…</p>
  {:else}
    <div class="layout">
      <article class="text card" lang={script === 'latn' ? 'kk-Latn' : 'kk'}>
        {#each data.paragraphs as para, pi (pi)}
          <p>
            {#each para as piece, k (k)}{#if typeof piece === 'string'}{sc(piece)}{:else}<button
                  type="button"
                  class="w"
                  class:on={sel === piece}
                  tabindex={sel === piece || (sel === null && piece === 0) ? 0 : -1}
                  bind:this={wordEls[piece]}
                  onmouseenter={() => !pinned && choose(piece)}
                  onfocus={() => choose(piece)}
                  onclick={() => choose(piece, true)}
                  onkeydown={(e) => onKey(e, piece)}>{sc(data.words[piece]!.t)}</button
                >{/if}{/each}
          </p>
        {/each}
        {#if script === 'both'}<p class="muted small" lang="en">Switch to Cyrillic or Latin to read; tap a word to see it in both.</p>{/if}
      </article>

      <aside class="box card" aria-live="polite">
        {#if w}
          <p class="t"><Kz text={w.t} script={script === 'both' ? 'both' : script} /></p>
          <p><strong><Kz text={w.lemma} {script} /></strong>{#if w.en}: {w.en}{/if}</p>
          {#if w.form}<p class="muted">{w.form}</p>{/if}
          <p class="src">{SOURCE_NAME[w.source]}</p>
          {#if w.ours}
            <p class="actions"><Hear text={w.lemma} icon credit={false} />{#if progressOn}{#if myWords[w.lemma]}<span class="muted small">In my words</span>{:else}<button class="btn quiet" onclick={() => onadd([w.lemma])}>Add to my words</button>{/if}{/if}</p>
          {/if}
          {#if pinned}<button class="btn quiet unpin" onclick={() => (pinned = false)}>Follow the pointer</button>{/if}
        {:else}
          <p class="muted">Tap or hover any word to see what it means. With the keyboard, Tab into the text and use the arrow keys.</p>
        {/if}
      </aside>
    </div>

    <section class="card">
      <h2>Questions</h2>
      {#each def.questions as q, qi (qi)}
        <fieldset class="q">
          <legend>{qi + 1}. {q.q} <span class="chip">{q.kind === 'inference' ? 'between the lines' : q.kind}</span></legend>
          {#each q.options as o, oi (oi)}
            <label class="opt" class:right={answers[qi] !== undefined && oi === q.answer} class:wrong={answers[qi] === oi && oi !== q.answer}>
              <input type="radio" name="q{qi}" disabled={answers[qi] !== undefined} onchange={() => (answers[qi] = oi)} /> {o}
            </label>
          {/each}
          {#if answers[qi] !== undefined}<p class="why" lang="en">{answers[qi] === q.answer ? 'Right.' : 'Not quite.'} {q.why}</p>{/if}
        </fieldset>
      {/each}
    </section>

    {#if ourWords.length}
      <section class="card">
        <h2>Words from our lists</h2>
        <p>{#each ourWords as x, k (x.kk)}{#if k}{', '}{/if}<Kz text={x.kk} {script} /> <span class="muted">({x.en})</span>{/each}</p>
        <p class="actions">
          <button class="btn primary" onclick={() => onpractise(ourWords, 'recognise')}>Practise these</button>
          {#if progressOn && notMine.length}<button class="btn" onclick={() => onadd(notMine.map((x) => x.kk))}>Add {notMine.length} to my words</button>{/if}
        </p>
      </section>
    {/if}

    <section class="credit muted small">
      <p>{AUTHOR}. Public domain. Text from <a href="https://wikisource.org/w/index.php?oldid={def.revid}" rel="noopener" target="_blank">Wikisource, revision {def.revid}</a> (transcription CC BY-SA 4.0).{#if data.notes.length} The source’s footnotes: {data.notes.join(' ')}{/if}</p>
      {#if def.corrections.length}<p>Corrected from the Wikisource copy: {#each def.corrections as c, k (c.from)}{#if k}{'; '}{/if}<span lang="kk">{c.from}</span> → <span lang="kk">{c.to}</span> ({c.why}){/each}.</p>{/if}
      <p>{data.wordCount} words. Explanations come from our word lists, Wiktionary (CC BY-SA 4.0), the rules, or our own notes, as each says.</p>
    </section>
  {/if}
{/if}

<style>
  .crumbs {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
  }
  .en-title {
    display: block;
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--muted);
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 260px;
    gap: 14px;
    align-items: start;
    margin-bottom: 14px;
  }
  @media (max-width: 760px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .box {
      position: sticky;
      bottom: 8px;
      order: 2;
    }
  }
  .text {
    font: 1.25rem/1.9 var(--serif);
  }
  .text p {
    margin: 0 0 0.9em;
  }
  .w {
    font: inherit;
    color: inherit;
    background: none;
    border: 0;
    padding: 0;
    border-radius: 3px;
    cursor: pointer;
  }
  .w:hover,
  .w.on {
    background: var(--mark);
  }
  .box {
    position: sticky;
    top: 12px;
    min-height: 120px;
  }
  .box p {
    margin: 4px 0;
  }
  .t {
    font: 700 1.4rem var(--serif);
  }
  .src {
    font-size: 0.8rem;
    color: var(--accent);
  }
  .actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .unpin {
    font-size: 0.85rem;
    padding: 0.2em 0.4em;
    min-height: 32px;
  }
  .q {
    border: 0;
    padding: 0;
    margin: 0 0 16px;
  }
  legend {
    font-weight: 700;
    margin-bottom: 6px;
  }
  .opt {
    display: block;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    margin: 4px 0;
    cursor: pointer;
  }
  .opt.right {
    border-color: var(--correct);
    background: var(--correct-soft);
  }
  .opt.wrong {
    border-color: var(--wrong);
    background: var(--wrong-soft);
  }
  .why {
    margin: 6px 0 0;
  }
  .small {
    font-size: 0.9rem;
  }
  .credit {
    margin-top: 12px;
  }
</style>
