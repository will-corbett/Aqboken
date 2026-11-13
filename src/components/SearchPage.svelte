<script lang="ts">
  import { search } from '../lib/search.ts';
  import { href } from '../lib/router.ts';
  import type { Script } from '../shared/script.ts';
  import Kz from './Kz.svelte';
  let { script }: { script: Script } = $props();
  let q = $state(new URLSearchParams(location.search).get('q') ?? '');
  let field = $state<HTMLInputElement>();
  const hits = $derived(search(q));
  $effect(() => field?.focus());
  $effect(() => {
    // Keep the query in the address (shareable), without adding history entries.
    const url = href({ page: 'search' }) + (q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '');
    if (location.pathname + location.search !== url) history.replaceState(null, '', url);
  });
</script>

<h1>Search</h1>
<form role="search" onsubmit={(e) => e.preventDefault()}>
  <label class="visually-hidden" for="sq">Search the site</label>
  <input id="sq" bind:this={field} bind:value={q} type="search" placeholder="A word in Kazakh or English, a topic…" autocomplete="off" spellcheck="false" />
</form>
<p class="muted small">Kazakh in Cyrillic or Latin; any form of a word finds it (кітабымда → кітап). Press / anywhere to search.</p>

{#if q.trim().length >= 2}
  <p role="status">{hits.length ? `${hits.length}${hits.length === 60 ? '+' : ''} results` : 'Nothing found.'}</p>
  <ul class="hits">
    {#each hits as h (h.href + h.title + h.kind)}
      <li>
        <span class="chip">{h.kind}</span>
        <a href={h.href} target={h.kind === 'Culture' ? '_blank' : undefined} rel={h.kind === 'Culture' ? 'noopener' : undefined}>{#if h.kind === 'Word'}<Kz text={h.title} {script} />{:else}{h.title}{/if}</a>
        {#if h.kk && h.kind !== 'Word'}<span class="muted"><Kz text={h.kk} {script} /></span>{/if}
        <p class="muted">{h.detail}</p>
      </li>
    {/each}
  </ul>
{/if}

<style>
  input {
    width: 100%;
    font-size: 1.3rem;
    padding: 10px 14px;
    border: 2px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
  }
  input:focus-visible {
    outline: none;
    border-color: var(--focus);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .small {
    font-size: 0.9rem;
  }
  .hits {
    list-style: none;
    padding: 0;
  }
  .hits li {
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
  }
  .hits a {
    font-weight: 700;
    margin: 0 6px;
  }
  .hits p {
    margin: 2px 0 0;
    font-size: 0.95rem;
  }
</style>
