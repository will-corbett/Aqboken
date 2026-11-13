<script lang="ts">
  import { AUTHOR, TEXTS } from '../data/reading.ts';
  import { href } from '../lib/router.ts';
  import type { Script } from '../shared/script.ts';
  import Kz from './Kz.svelte';
  let { script }: { script: Script } = $props();
  const LEVELS = ['A2', 'B1', 'B2'] as const;
</script>

<h1>Reading</h1>
<p>Short stories by {AUTHOR}: fables and tales written to teach Kazakh children to read, so the sentences are short and the morals clear. Every word is explained: tap or hover any word.</p>
<p class="muted small">Written in the 1870s, so a few words are old-fashioned (the explanations say so), and the storyteller’s past tense (-ыпты: “it is said that …”) is everywhere.</p>
{#each LEVELS as l (l)}
  {@const list = TEXTS.filter((t) => t.level === l)}
  {#if list.length}
    <h2>{l}</h2>
    <ul class="texts">
      {#each list as t (t.id)}
        <li>
          <a class="card text" href={href({ page: 'reading', text: t.id })}>
            <span class="title"><Kz text={t.title} {script} /></span>
            <span class="en">{t.en}</span>
            <span class="muted">{t.blurb}</span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
{/each}

<style>
  .small {
    font-size: 0.9rem;
  }
  .texts {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }
  .text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 100%;
    color: var(--text);
    text-decoration: none;
  }
  .text:hover {
    border-color: var(--accent);
  }
  .title {
    font: 700 1.25rem var(--serif);
  }
  .en {
    font-weight: 700;
  }
</style>
