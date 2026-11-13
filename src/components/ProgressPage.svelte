<script lang="ts">
  import { ALL_WORDS } from '../data/words.ts';
  import { INTERVALS, type MyWords } from '../lib/mywords.ts';
  import type { Progress } from '../lib/progress.ts';
  import { href } from '../lib/router.ts';
  import { scoreClass } from '../lib/score.ts';
  import type { Settings } from '../lib/settings.ts';
  import { TOPICS } from '../lib/topics.ts';
  import Kz from './Kz.svelte';

  let { settings, progress, myWords, due, onprogress, onremove, onreview }: { settings: Settings; progress: Progress; myWords: MyWords; due: string[]; onprogress: (on: boolean) => void; onremove: (w: string) => void; onreview: () => void } = $props();
  const words = $derived(Object.entries(myWords).sort(([a, x], [b, y]) => x.due.localeCompare(y.due) || a.localeCompare(b)));
  const played = $derived(TOPICS.filter((t) => progress[t.id]));
  const en = (kk: string) => ALL_WORDS.find((w) => w.kk === kk)?.en ?? '';
</script>

<h1>Your progress</h1>
{#if !settings.progress}
  <p>Progress is off. If you turn it on, Körti remembers, in this browser only, how each drill went and the words you’ve practised, and brings words back for review when they’re due. Nothing is sent anywhere; turning it off deletes it.</p>
  <button class="btn primary" onclick={() => onprogress(true)}>Turn on progress</button>
{:else}
  <p class="muted">Kept in this browser only. <a href={href({ page: 'settings' })}>Turn it off</a> to delete it.</p>

  <section class="card">
    <h2>My words</h2>
    {#if !words.length}
      <p>No words yet. Every word you answer in a <a href={href({ page: 'drill', mode: 'vocab' })}>vocabulary</a> or <a href={href({ page: 'drill', mode: 'listen' })}>listening</a> drill is added, or use “Add all to my words” on a <a href={href({ page: 'vocabulary' })}>theme</a>.</p>
    {:else}
      <p>
        <strong>{words.length}</strong> {words.length === 1 ? 'word' : 'words'}; <strong>{due.length}</strong> due today.
        {#if due.length}<button class="btn primary" onclick={onreview}>Review the {due.length} due</button>{/if}
      </p>
      <p class="muted small">Right first time, a word comes back later each time ({INTERVALS.join(', ')} days); missed, it comes back tomorrow.</p>
      <div class="table-scroll">
        <table class="forms">
          <thead><tr><th>Word</th><th>Meaning</th><th>Next review</th><th>Step</th><th></th></tr></thead>
          <tbody>
            {#each words as [w, st] (w)}
              <tr>
                <td><Kz text={w} script={settings.script} /></td>
                <td class="muted">{en(w)}</td>
                <td>{st.due}</td>
                <td>{st.box + 1} of {INTERVALS.length}</td>
                <td><button class="btn quiet small-btn" aria-label="Remove {w}" onclick={() => onremove(w)}>Remove</button></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>

  <section class="card">
    <h2>Drills</h2>
    {#if !played.length}
      <p>No rounds yet.</p>
    {:else}
      <table class="forms">
        <thead><tr><th>Drill</th><th>Rounds</th><th>Last score</th><th>Last practised</th></tr></thead>
        <tbody>
          {#each played as t (t.id)}
            {@const p = progress[t.id]!}
            <tr><td><a href={href({ page: 'drill', mode: t.id })}>{t.title}</a></td><td>{p.rounds}</td><td class={scoreClass(p.last)}>{p.last}%</td><td>{p.date}</td></tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>
{/if}

<style>
  .card {
    margin-bottom: 14px;
  }
  h2 {
    margin-top: 0;
    font-size: 1.2rem;
  }
  .small {
    font-size: 0.9rem;
  }
  .small-btn {
    min-height: 32px;
    padding: 0 8px;
  }
</style>
