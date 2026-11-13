<script lang="ts">
  import { href } from '../lib/router.ts';
  import { GROUPS, TOPICS } from '../lib/topics.ts';
  import type { Progress } from '../lib/progress.ts';
  import type { Settings } from '../lib/settings.ts';
  import Kz from './Kz.svelte';
  import { scoreClass } from '../lib/score.ts';
  let { settings, progress }: { settings: Settings; progress: Progress } = $props();
</script>

<h1>Learn and drill</h1>
<p class="lead muted">Every topic, easiest first in each group: a short explanation with tables, then a drill.</p>
{#each GROUPS as g (g)}
  <section>
    <h2>{g}</h2>
    <ul class="topics">
      {#each TOPICS.filter((t) => t.group === g) as t (t.id)}
        {@const p = settings.progress ? progress[t.id] : undefined}
        <li class="card topic">
          <div class="head">
            <h3>{#if t.learn}<a href={href({ page: 'learn', topic: t.id })}>{t.title}</a>{:else}{t.title}{/if}</h3>
            <span class="chip">{t.level}</span>
          </div>
          <p class="kk muted"><Kz text={t.kk} script={settings.script} /></p>
          <p class="blurb">{t.blurb}</p>
          <div class="links">
            {#if t.learn}<a class="btn" href={href({ page: 'learn', topic: t.id })}>Learn</a>{/if}
            <a class="btn primary" href={href({ page: 'drill', mode: t.id })}>Drill</a>
            {#if p}<span class="prog">Last round <strong class={scoreClass(p.last)}>{p.last}%</strong> · {p.rounds} {p.rounds === 1 ? 'round' : 'rounds'}</span>{/if}
          </div>
        </li>
      {/each}
    </ul>
  </section>
{/each}

<style>
  .lead {
    margin-top: -8px;
  }
  .topics {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
  .topic {
    display: flex;
    flex-direction: column;
  }
  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }
  h3 {
    margin: 0;
    font-size: 1.15rem;
  }
  h3 a {
    color: var(--text);
    text-decoration: none;
  }
  h3 a:hover {
    text-decoration: underline;
  }
  .kk {
    margin: 2px 0 0;
  }
  .blurb {
    flex: 1;
  }
  .links {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .prog {
    font-size: 0.9rem;
    color: var(--muted);
  }
</style>
