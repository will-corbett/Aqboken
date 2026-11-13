<script lang="ts">
  import { THEMES } from '../data/words.ts';
  import { href } from '../lib/router.ts';
  import type { Script } from '../shared/script.ts';
  import Kz from './Kz.svelte';
  let { script }: { script: Script } = $props();
</script>

<h1>Vocabulary</h1>
<p class="muted">Everyday words by theme. Open a theme to see its words with their forms, and practise them both ways round.</p>
<ul class="themes">
  {#each THEMES as t (t.id)}
    <li>
      <a class="card theme" href={href({ page: 'vocabulary', theme: t.id })}>
        <span class="head"><strong>{t.title}</strong> <span class="chip">{t.level}</span></span>
        <span class="kk muted"><Kz text={t.kkTitle} {script} /></span>
        <span class="blurb">{t.blurb}</span>
        <span class="muted small">{t.words.length} words</span>
      </a>
    </li>
  {/each}
</ul>

<style>
  .themes {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }
  .theme {
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 100%;
    color: var(--text);
    text-decoration: none;
  }
  .theme:hover {
    border-color: var(--accent);
  }
  .head {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 1.1rem;
  }
  .blurb {
    flex: 1;
  }
  .small {
    font-size: 0.85rem;
  }
</style>
