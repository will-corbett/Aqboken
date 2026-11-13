<script lang="ts">
  /** A Tatoeba example: the Kazakh (its word highlighted, in the reader's script), the English, audio and credit. */
  import type { SentenceRow } from '../lib/sentences.ts';
  import { toLatin, type Script } from '../shared/script.ts';
  import Hear from './Hear.svelte';
  let { row, script, compact = false }: { row: SentenceRow; script: Script; compact?: boolean } = $props();
  const [id, kk, en, owner, start, end] = $derived(row);
  const sc = (t: string) => (script === 'latn' ? toLatin(t) : t);
</script>

<figure class="sentence" class:compact>
  <blockquote lang={script === 'latn' ? 'kk-Latn' : 'kk'}>
    {sc(kk.slice(0, start))}<mark>{sc(kk.slice(start, end))}</mark>{sc(kk.slice(end))}
    {#if script === 'both'}<span class="lat" lang="kk-Latn">{toLatin(kk)}</span>{/if}
  </blockquote>
  <figcaption>
    <span lang="en">{en}</span>
    {#if !compact}<Hear text={kk} />{:else}<Hear text={kk} icon credit={false} />{/if}
    <span class="src"><a href="https://tatoeba.org/en/sentences/show/{id}" rel="noopener" target="_blank">Tatoeba #{id}</a>{owner ? `, by ${owner}` : ''} (CC BY 2.0 FR)</span>
  </figcaption>
</figure>

<style>
  .sentence {
    margin: 10px 0 0;
  }
  blockquote {
    margin: 0;
    font-family: var(--serif);
    font-size: 1.15rem;
  }
  .compact blockquote {
    font-size: 1rem;
  }
  mark {
    background: var(--mark);
    color: inherit;
    border-radius: 3px;
    padding: 0 2px;
  }
  .lat {
    display: block;
    font-family: var(--sans);
    font-size: 0.85em;
    color: var(--muted);
  }
  figcaption {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 8px;
    color: var(--muted);
    font-size: 0.9rem;
  }
  .src {
    font-size: 0.8rem;
  }
</style>
