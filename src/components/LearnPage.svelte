<script lang="ts">
  import { LEARN } from '../lib/learn.ts';
  import { parse } from '../lib/markdown.ts';
  import { href } from '../lib/router.ts';
  import { TOPICS, topicById } from '../lib/topics.ts';
  import type { Settings } from '../lib/settings.ts';
  import FormsTable from './FormsTable.svelte';
  import Kz from './Kz.svelte';

  let { topic, settings }: { topic: string; settings: Settings } = $props();
  const t = $derived(topicById(topic));
  const page = $derived(LEARN[topic] ? parse(LEARN[topic]!, settings.script) : null);
  const learnable = TOPICS.filter((x) => x.learn);
  const i = $derived(learnable.findIndex((x) => x.id === topic));
  const prev = $derived(i > 0 ? learnable[i - 1] : undefined);
  const next = $derived(i >= 0 ? learnable[i + 1] : undefined);
</script>

{#if t && page}
  <article class="learn">
    <p class="crumbs"><a href={href({ page: 'learn' })}>Learn</a> · {t.group} · <span class="chip">{t.level}</span></p>
    <h1>{t.title} <span class="kk-title"><Kz text={t.kk} script={settings.script} /></span></h1>
    {#each page.blocks as b, bi (bi)}
      {#if b.type === 'h2'}<h2>{@html b.html}</h2>
      {:else if b.type === 'h3'}<h3>{@html b.html}</h3>
      {:else if b.type === 'p'}<p>{@html b.html}</p>
      {:else if b.type === 'ul'}<ul>{#each b.items as it, ii (ii)}<li>{@html it}</li>{/each}</ul>
      {:else if b.type === 'table'}
        <div class="table-scroll">
          <table class="forms">
            <thead><tr>{#each b.head as h, hi (hi)}<th>{@html h}</th>{/each}</tr></thead>
            <tbody>{#each b.rows as r, ri (ri)}<tr>{#each r as c, ci (ci)}<td>{@html c}</td>{/each}</tr>{/each}</tbody>
          </table>
        </div>
      {:else if b.type === 'forms'}<FormsTable kind={b.kind} words={b.words} script={settings.script} />
      {:else if b.type === 'drill'}
        <p class="practise"><a class="btn primary" href={href({ page: 'drill', mode: b.mode })}>Practise: {topicById(b.mode)?.title ?? b.mode} →</a></p>
      {/if}
    {/each}
    <nav class="pager" aria-label="More topics">
      {#if prev}<a class="btn" href={href({ page: 'learn', topic: prev.id })}>← {prev.title}</a>{/if}
      {#if next}<a class="btn" href={href({ page: 'learn', topic: next.id })}>{next.title} →</a>{/if}
    </nav>
  </article>
{:else}
  <p>There is no Learn page called “{topic}”. <a href={href({ page: 'learn' })}>All topics</a></p>
{/if}

<style>
  .learn {
    max-width: 46rem;
  }
  .learn :global(p),
  .learn :global(li) {
    line-height: 1.6;
  }
  .learn :global(.lat) {
    font-size: 0.85em;
    color: var(--muted);
  }
  .learn :global([lang='kk']) {
    font-family: var(--serif);
  }
  .crumbs {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
  }
  h1 {
    margin: 6px 0 16px;
  }
  .kk-title {
    display: block;
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--muted);
    margin-top: 4px;
  }
  h2 {
    margin-top: 1.8em;
  }
  .practise {
    margin: 20px 0;
  }
  .pager {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 40px;
    border-top: 1px solid var(--border);
    padding-top: 16px;
  }
</style>
