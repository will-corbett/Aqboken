<script lang="ts">
  import { missed, score, type Round } from '../lib/queue.ts';
  import type { Question } from '../lib/questions.ts';
  import { scoreClass } from '../lib/score.ts';
  import type { Script } from '../shared/script.ts';
  import Kz from './Kz.svelte';
  let { round, script, onagain, onsettings }: { round: Round<Question>; script: Script; onagain: () => void; onsettings: () => void } = $props();
  const s = $derived(score(round));
  const wrong = $derived(missed(round));
  let again = $state<HTMLButtonElement>();
  $effect(() => again?.focus());
</script>

<section class="end">
  <h1>Round finished</h1>
  {#if s.attempted}
    <p class="big"><strong class={scoreClass(s.percent)}>{s.percent}%</strong> right first time <span class="muted">({s.firstTry} of {s.attempted}{s.attempted < s.total ? `; ${s.total - s.attempted} not reached` : ''})</span></p>
  {:else}
    <p>No questions answered.</p>
  {/if}
  <div class="actions">
    <button class="btn primary" bind:this={again} onclick={onagain}>Another round</button>
    <button class="btn" onclick={onsettings}>Change settings</button>
  </div>
  {#if wrong.length}
    <h2>To look at again</h2>
    <ul class="card missed">
      {#each wrong as e (e.q.key)}
        <li>
          <span class="muted">{e.q.task}:</span>
          {#if e.q.promptLang === 'kk'}<Kz text={e.q.prompt} {script} />{:else}{e.q.prompt}{/if} →
          <strong>{#if e.q.answerLang === 'kk' || e.q.choiceLang === 'kk'}<Kz text={e.q.answer} {script} mark={e.q.base ?? ''} />{:else}{e.q.answer}{/if}</strong>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .big {
    font-size: 1.3rem;
  }
  .big strong {
    font-size: 2.2rem;
  }
  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .missed {
    list-style: none;
    padding: 12px 20px;
  }
  .missed li {
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
  }
  .missed li:last-child {
    border: 0;
  }
</style>
