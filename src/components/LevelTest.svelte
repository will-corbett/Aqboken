<script lang="ts">
  /** The grammar test (src/lib/levelTest.ts): one question per screen, Back/Next, then the result. In memory only. */
  import { TEST_LEVELS, buildTest, optionLabel, scoreTest, type TestItem } from '../lib/levelTest.ts';
  import { mulberry32 } from '../lib/rng.ts';
  import { href } from '../lib/router.ts';
  import type { Settings } from '../lib/settings.ts';
  import { topicById } from '../lib/topics.ts';
  import { toLatin } from '../shared/script.ts';
  import Kz from './Kz.svelte';

  let { settings = $bindable() }: { settings: Settings } = $props();
  let items = $state<TestItem[] | null>(null);
  let answers = $state<(string | undefined)[]>([]);
  let i = $state(0);
  let done = $state(false);
  const result = $derived(items && done ? scoreTest(items, answers) : null);
  const show = (t: string) => (settings.script === 'latn' ? toLatin(t) : t);
  const missedTopics = $derived(items && done ? [...new Set(items.filter((it, k) => answers[k] !== it.q.answer).map((it) => it.q.mode))] : []);

  function start() {
    const p = new URLSearchParams(location.search).get('seed');
    items = buildTest(mulberry32(p ? Number(p) : Math.floor(Math.random() * 2 ** 31)));
    answers = items.map(() => undefined);
    i = 0;
    done = false;
  }
  function onKey(e: KeyboardEvent) {
    if (!items || done) return;
    const n = Number(e.key);
    const it = items[i]!;
    if (n >= 1 && n <= it.options.length) answers[i] = it.options[n - 1];
    else if (e.key === 'Enter' && answers[i] !== undefined) next();
  }
  function next() {
    if (!items) return;
    if (i < items.length - 1) i++;
    else done = true;
  }
</script>

<svelte:window onkeydown={onKey} />

{#if !items}
  <h1>Grammar test</h1>
  <p>36 questions, 12 each at A1, A2 and B1, easiest first. Each asks for one form of a word; choose the one that fits. It takes about ten minutes.</p>
  <p>At the end you’ll see an approximate level for your <strong>grammar</strong> (not reading, listening or speaking), every wrong answer explained, and the lessons worth reviewing. Nothing is saved.</p>
  <button class="btn primary" onclick={start}>Start the test</button>
{:else if !done}
  {@const it = items[i]!}
  {@const q = it.q}
  <div class="bar">
    <p class="count">Question <strong>{i + 1}</strong> of {items.length} <span class="chip">{it.level}</span></p>
    <button class="btn quiet" onclick={() => (done = true)}>Finish now</button>
  </div>
  <div class="progress" aria-hidden="true"><span style="width: {(100 * i) / items.length}%"></span></div>
  <section class="card q" aria-labelledby="tq">
    <p class="task">{q.task}</p>
    <h1 id="tq" class="word"><Kz text={q.prompt} script={settings.script} /></h1>
    {#if q.gloss}<p class="muted">{q.gloss}</p>{/if}
    {#if q.cue}<p class="cue">“{q.cue}”</p>{/if}
    {#if q.frame}<p class="frame"><Kz text={q.frame[0]} script={settings.script} /> ___<Kz text={q.frame[1]} script={settings.script} /></p>{/if}
    <div class="options" role="radiogroup" aria-label="Choose the answer">
      {#each it.options as o, k (o)}
        <label class="opt" class:on={answers[i] === o}>
          <input type="radio" name="q{i}" checked={answers[i] === o} onchange={() => (answers[i] = o)} />
          <span class="num" aria-hidden="true">{k + 1}</span> <span lang="kk">{show(o)}</span>
        </label>
      {/each}
    </div>
    <div class="nav">
      <button class="btn" disabled={i === 0} onclick={() => i--}>Back</button>
      <button class="btn primary" disabled={answers[i] === undefined} onclick={next}>{i === items.length - 1 ? 'See my result' : 'Next'}</button>
      <button class="btn quiet" onclick={next}>Skip</button>
    </div>
  </section>
{:else if result}
  <h1>Your result</h1>
  <section class="card">
    {#if result.level}
      <p class="big">Your grammar is around <strong>{result.level}</strong>.</p>
    {:else}
      <p class="big">You’re at the start: <strong>below A1</strong> in this test.</p>
    {/if}
    <table class="forms">
      <thead><tr><th>Level</th><th>Right</th></tr></thead>
      <tbody>{#each TEST_LEVELS as l (l)}<tr><td>{l}</td><td>{result.byLevel[l].right} of {result.byLevel[l].total}</td></tr>{/each}</tbody>
    </table>
    <p class="muted small">You reach a level with 9 of 12 there and at least 8 of 12 at every level below. It measures grammar only.</p>
    <p>
        {#if settings.pathLevel !== (result.level ?? 'A1')}<button class="btn primary" onclick={() => (settings.pathLevel = result!.level ?? 'A1')}>Set my learning path to {result.level ?? 'A1'}</button>{/if}
        <a class="btn" href={href({ page: 'paths' })}>Learning paths</a>
        <button class="btn quiet" onclick={start}>Take it again</button>
    </p>
  </section>

  {#if missedTopics.length}
    <h2>Worth reviewing</h2>
    <p>{#each missedTopics as m, k (m)}{#if k}{', '}{/if}{#if topicById(m)?.learn}<a href={href({ page: 'learn', topic: m })}>{topicById(m)?.title}</a>{:else}{topicById(m)?.title}{/if}{/each}</p>
  {/if}

  <h2>Every question</h2>
  <ol class="review">
    {#each items as it, k (k)}
      {@const a = answers[k]}
      {@const ok = a === it.q.answer}
      <li class:ok class:bad={!ok}>
        <p><span class="chip">{it.level}</span> {it.q.task}: <Kz text={it.q.prompt} script={settings.script} />{#if it.q.cue} (“{it.q.cue}”){/if}</p>
        <p>
          {ok ? '✓' : '✗'} <strong lang="kk">{show(it.q.answer)}</strong>
          {#if !ok}{#if a}— you chose <span lang="kk">{show(a)}</span>{#if optionLabel(it.q, a)}, the {optionLabel(it.q, a)}{/if}{:else}— not answered{/if}{/if}
        </p>
        {#if !ok}<p class="muted">{settings.script === 'latn' ? toLatin(it.q.explain) : it.q.explain}</p>{/if}
      </li>
    {/each}
  </ol>
{/if}

<style>
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .count {
    margin: 0;
  }
  .progress {
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    margin: 6px 0 14px;
    overflow: hidden;
  }
  .progress span {
    display: block;
    height: 100%;
    background: var(--gold, var(--primary-bg));
  }
  .task {
    margin: 0;
    font-weight: 700;
    color: var(--accent);
  }
  .word {
    font-family: var(--serif);
    font-size: clamp(1.8rem, 7vw, 2.4rem);
    margin: 4px 0 0;
  }
  .cue {
    font-style: italic;
  }
  .frame {
    font: 1.4rem var(--serif);
  }
  .options {
    display: grid;
    gap: 8px;
    margin: 12px 0;
  }
  .opt {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    cursor: pointer;
    font: 1.2rem var(--serif);
  }
  .opt.on {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .opt input {
    accent-color: var(--accent);
  }
  .num {
    font: 700 0.8rem var(--sans);
    color: var(--muted);
  }
  .nav {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .big {
    font-size: 1.3rem;
  }
  .small {
    font-size: 0.9rem;
  }
  .review {
    padding-left: 1.4em;
  }
  .review li {
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
  }
  .review p {
    margin: 2px 0;
  }
  .review strong {
    color: var(--correct);
  }
</style>
