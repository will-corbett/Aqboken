<script lang="ts">
  import { themeById } from '../data/words.ts';
  import { textById } from '../data/reading.ts';
  import type { MyWords } from '../lib/mywords.ts';
  import { LEVELS, PATHS, stepDone, type Level } from '../lib/paths.ts';
  import type { Progress } from '../lib/progress.ts';
  import { href } from '../lib/router.ts';
  import type { Settings } from '../lib/settings.ts';
  import { topicById } from '../lib/topics.ts';
  import Kz from './Kz.svelte';

  let { settings = $bindable(), progress, myWords }: { settings: Settings; progress: Progress; myWords: MyWords } = $props();
  const path = $derived(PATHS.find((p) => p.level === settings.pathLevel)!);
  const done = $derived(settings.progress ? path.steps.filter((s) => stepDone(s, progress, myWords)).length : 0);
</script>

<h1>Learning paths</h1>
<p>A recommended route through Aqböken for each level: lessons and their drills, and vocabulary themes, in an order that builds up. It’s a guide, not a gate: skip what you know, go back to anything.</p>

<div class="levels" role="group" aria-label="Your level">
  {#each LEVELS as l (l)}
    <button type="button" class="btn" class:primary={settings.pathLevel === l} aria-pressed={settings.pathLevel === l} onclick={() => (settings.pathLevel = l as Level)}>{l}</button>
  {/each}
</div>

<section class="card">
  <h2>{path.title}</h2>
  <p>{path.intro}</p>
  {#if settings.progress}
    <p class="muted">{done} of {path.steps.length} steps done. A topic counts once you’ve played its drill; a theme once half its words are in <a href={href({ page: 'progress' })}>my words</a>.</p>
  {:else}
    <p class="muted">Turn on <a href={href({ page: 'progress' })}>progress</a> to have steps ticked off as you go.</p>
  {/if}
  <ol class="steps">
    {#each path.steps as s, i (i)}
      {@const ok = settings.progress && stepDone(s, progress, myWords)}
      <li class:ok>
        <span class="tick" aria-hidden="true">{ok ? '✓' : ''}</span>
        <div>
          {#if s.kind === 'topic'}
            {@const tp = topicById(s.id)!}
            <strong>{tp.title}</strong> <span class="muted small"><Kz text={tp.kk} script={settings.script} /></span>
            <span class="links">{#if tp.learn}<a href={href({ page: 'learn', topic: s.id })}>Learn</a> · {/if}<a href={href({ page: 'drill', mode: s.id })}>Drill</a></span>
          {:else if s.kind === 'reading'}
            {@const tx = textById(s.id)!}
            <strong>Read: {tx.en}</strong> <span class="muted small"><Kz text={tx.title} script={settings.script} /></span>
            <span class="links"><a href={href({ page: 'reading', text: s.id })}>Read</a></span>
          {:else}
            {@const th = themeById(s.id)!}
            <strong>Words: {th.title}</strong> <span class="muted small"><Kz text={th.kkTitle} script={settings.script} /></span>
            <span class="links"><a href={href({ page: 'vocabulary', theme: s.id })}>Words</a></span>
          {/if}
          <p class="why">{s.why}{ok ? ' (done)' : ''}</p>
        </div>
      </li>
    {/each}
  </ol>
</section>

<style>
  .levels {
    display: flex;
    gap: 8px;
    margin: 12px 0 16px;
  }
  h2 {
    margin-top: 0;
  }
  .steps {
    list-style: none;
    padding: 0;
    margin: 0;
    counter-reset: step;
  }
  .steps li {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    border-top: 1px solid var(--border);
    counter-increment: step;
  }
  .tick {
    flex: none;
    width: 1.8em;
    height: 1.8em;
    border-radius: 50%;
    border: 2px solid var(--border);
    display: grid;
    place-items: center;
    font-weight: 700;
    color: var(--primary-text);
  }
  .tick:empty::before {
    content: counter(step);
    color: var(--muted);
    font-size: 0.85rem;
  }
  li.ok .tick {
    background: var(--primary-bg);
    border-color: var(--primary-bg);
  }
  .links {
    margin-left: 6px;
    font-size: 0.9rem;
  }
  .why {
    margin: 2px 0 0;
    color: var(--muted);
    font-size: 0.95rem;
  }
  .small {
    font-size: 0.9em;
  }
</style>
