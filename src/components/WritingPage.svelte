<script lang="ts">
  import { WRITING, type WritingTask } from '../data/writing.ts';
  import { themeById } from '../data/words.ts';
  import { href } from '../lib/router.ts';
  import { topicById } from '../lib/topics.ts';
  import type { Settings } from '../lib/settings.ts';
  import Keyboard from './Keyboard.svelte';
  import RecordCompare from './RecordCompare.svelte';

  let { settings = $bindable() }: { settings: Settings } = $props();
  let open = $state<string | null>(null);
  let text = $state('');
  let checked = $state<Record<string, boolean>>({});
  let area = $state<HTMLTextAreaElement>();
  const words = $derived(text.trim() ? text.trim().split(/\s+/).length : 0);
  const LEVELS = ['A1', 'A2', 'B1'] as const;

  function choose(t: WritingTask) {
    if (open !== t.id) {
      open = t.id;
      text = '';
      checked = {};
    }
  }
  function insert(s: string) {
    if (!area) return;
    const [a, b] = [area.selectionStart, area.selectionEnd];
    text = text.slice(0, a) + s + text.slice(b);
    queueMicrotask(() => {
      area!.focus();
      area!.selectionStart = area!.selectionEnd = a + s.length;
    });
  }
</script>

<h1>Writing</h1>
<p>Write short texts in Kazakh, with a checklist of the grammar to use. Nothing you type is kept: copy it somewhere if you want it later. There are no model answers yet: we’ll add them once a native speaker can check them. Ask a Kazakh speaker to read yours, or read it aloud and record yourself.</p>

{#each LEVELS as l (l)}
  <h2>{l}</h2>
  <ul class="tasks">
    {#each WRITING.filter((t) => t.level === l) as t (t.id)}
      <li class="card task" class:open={open === t.id}>
        <h3>{t.title}</h3>
        <p>{t.brief} <span class="muted">({t.words})</span></p>
        {#if open !== t.id}
          <button class="btn" onclick={() => choose(t)}>Write this</button>
        {:else}
          <fieldset>
            <legend>Check before you finish</legend>
            {#each t.checklist as c, i (i)}
              <label class="check"><input type="checkbox" bind:checked={checked[`${t.id}:${i}`]} /> <span>{c.text}{#if c.topic && topicById(c.topic)?.learn} <a href={href({ page: 'learn', topic: c.topic })}>Learn</a>{/if}</span></label>
            {/each}
          </fieldset>
          <p class="muted small">Useful words: {#each t.themes as th, i (th)}{#if i}{', '}{/if}<a href={href({ page: 'vocabulary', theme: th })}>{themeById(th)?.title}</a>{/each}</p>
          <label class="visually-hidden" for="w-{t.id}">Your text</label>
          <textarea id="w-{t.id}" bind:this={area} bind:value={text} lang="kk" rows="8" spellcheck="false" placeholder="Жазыңыз… (Cyrillic or Latin)"></textarea>
          <p class="bar">
            <span class="muted">{words} {words === 1 ? 'word' : 'words'}</span>
            <button class="btn quiet" type="button" aria-pressed={settings.keyboard} onclick={() => (settings.keyboard = !settings.keyboard)}><span aria-hidden="true">⌨</span> {settings.keyboard ? 'Hide keyboard' : 'Kazakh keyboard'}</button>
            <RecordCompare label="Read it aloud and record" />
          </p>
          {#if settings.keyboard}<Keyboard oninsert={insert} onbackspace={() => (text = text.slice(0, -1))} script={settings.script} />{/if}
        {/if}
      </li>
    {/each}
  </ul>
{/each}

<style>
  .tasks {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 12px;
  }
  .task h3 {
    margin: 0 0 4px;
  }
  .task.open {
    border-color: var(--accent);
  }
  fieldset {
    border: 0;
    padding: 0;
    margin: 8px 0;
  }
  legend {
    font-weight: 700;
    margin-bottom: 4px;
  }
  .check {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 3px 0;
  }
  .check input {
    margin-top: 0.3em;
    accent-color: var(--accent);
  }
  textarea {
    width: 100%;
    font: 1.15rem/1.6 var(--serif);
    padding: 10px 12px;
    border: 2px solid var(--border);
    border-radius: 10px;
    background: var(--surface-2);
    color: var(--text);
  }
  textarea:focus-visible {
    outline: none;
    border-color: var(--focus);
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .small {
    font-size: 0.9rem;
  }
</style>
