<script lang="ts">
  import { CULTURE, TYPE_ACTIVITY, TYPE_NAME, type CultureType } from '../data/culture.ts';
  const types = [...new Set(CULTURE.map((c) => c.type))] as CultureType[];
  let filter = $state<CultureType | 'all'>('all');
</script>

<h1>Culture and more Kazakh</h1>
<p>Hand-picked places to read, watch and listen to Kazakh, and other courses to use alongside Aqböken. Each is the creator’s own site or channel; we checked what each actually publishes. They are links only: nothing from them loads on this site.</p>

<div class="filters" role="group" aria-label="Show">
  <button class="btn" class:primary={filter === 'all'} aria-pressed={filter === 'all'} onclick={() => (filter = 'all')}>All</button>
  {#each types as t (t)}
    <button class="btn" class:primary={filter === t} aria-pressed={filter === t} onclick={() => (filter = t)}>{TYPE_NAME[t]}</button>
  {/each}
</div>

{#each types.filter((t) => filter === 'all' || filter === t) as t (t)}
  <section>
    <h2>{TYPE_NAME[t]}</h2>
    <p class="activity"><strong>Try this:</strong> {TYPE_ACTIVITY[t]}</p>
    <ul class="links">
      {#each CULTURE.filter((c) => c.type === t) as c (c.url)}
        <li class="card">
          <a class="title" href={c.url} rel="noopener" target="_blank">{c.title} <span aria-hidden="true">↗</span></a>
          <span class="chip">{c.level}</span>
          <p>{c.about}</p>
          {#if c.note}<p class="muted small">{c.note}</p>{/if}
        </li>
      {/each}
    </ul>
  </section>
{/each}
<p class="muted small">Links checked by hand on {CULTURE[0]!.checked}. A link gone wrong? Please tell us.</p>

<style>
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 8px 0 4px;
  }
  .activity {
    margin-top: -6px;
  }
  .links {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
  .title {
    font-weight: 700;
    font-size: 1.1rem;
    margin-right: 6px;
  }
  .links p {
    margin: 6px 0 0;
  }
  .small {
    font-size: 0.9rem;
  }
</style>
