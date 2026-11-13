<script lang="ts">
  import { themeById, type Word } from '../data/words.ts';
  import { nounOptions } from '../data/exceptions.ts';
  import { href } from '../lib/router.ts';
  import { plural, present, past } from '../shared/kazakh.ts';
  import type { Script } from '../shared/script.ts';
  import Kz from './Kz.svelte';
  let { id, script, onpractise }: { id: string; script: Script; onpractise: (words: Word[], direction: 'recognise' | 'recall') => void } = $props();
  const t = $derived(themeById(id));
  const POS: Record<string, string> = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb', pron: 'pronoun', phr: 'phrase', num: 'number', post: 'postposition', conj: 'conjunction' };
</script>

{#if t}
  <p class="crumbs"><a href={href({ page: 'vocabulary' })}>Vocabulary</a> · <span class="chip">{t.level}</span></p>
  <h1>{t.title} <span class="kk-title"><Kz text={t.kkTitle} {script} /></span></h1>
  <p>{t.blurb}</p>
  <div class="actions">
    <button class="btn primary" onclick={() => onpractise(t.words, 'recognise')}>Practise: what does it mean?</button>
    <button class="btn" onclick={() => onpractise(t.words, 'recall')}>Practise: say it in Kazakh</button>
  </div>
  <div class="table-scroll">
    <table class="forms words">
      <thead><tr><th>Kazakh</th><th>Meaning</th><th>Forms</th></tr></thead>
      <tbody>
        {#each t.words as w (w.kk)}
          <tr>
            <td class="kkw"><Kz text={w.kk} {script} /></td>
            <td>{w.en} <span class="muted small">{POS[w.pos]}</span></td>
            <td class="small">
              {#if w.pos === 'n' && !w.noDrill && !w.kk.includes(' ')}<Kz text={plural(w.kk, nounOptions(w.kk))} mark={w.kk} {script} />
              {:else if w.pos === 'v' && w.stem}<Kz text={present(w.stem, '1sg')} mark={w.stem} {script} />, <Kz text={past(w.stem, '1sg')} mark={w.stem} {script} />
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="muted small">Forms: nouns in the plural; verbs as “I do” and “I did” (stem + ending highlighted).</p>
{:else}
  <p>No theme called “{id}”. <a href={href({ page: 'vocabulary' })}>All themes</a></p>
{/if}

<style>
  .crumbs {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
  }
  .kk-title {
    display: block;
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--muted);
  }
  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .words {
    width: 100%;
  }
  .kkw {
    font-size: 1.15rem;
  }
  .small {
    font-size: 0.85rem;
  }
</style>
