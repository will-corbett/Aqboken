<script lang="ts">
  import { href } from '../lib/router.ts';
  import { TOPICS, topicById } from '../lib/topics.ts';
  import type { Settings } from '../lib/settings.ts';
  import { THEMES } from '../data/words.ts';
  import Kz from './Kz.svelte';
  let { settings, oncontinue, due = 0, onreview }: { settings: Settings; oncontinue: () => void; due?: number; onreview: () => void } = $props();
  const FIRST = ['alphabet', 'harmony', 'plural', 'copula', 'cases', 'present'] as const;
</script>

<section class="hero">
  <h1>Learn Kazakh, one ending at a time</h1>
  <p class="lead">Kazakh builds words from a stem and a chain of endings, and each ending follows a handful of sound rules. Körti explains the rules simply, shows them at work in tables, and drills them until they’re automatic.</p>
  <p class="greeting"><Kz text="Қош келдіңіз!" script={settings.script} /> <span class="muted">Welcome!</span></p>
</section>

{#if settings.lastDrill && topicById(settings.lastDrill)}
  <div class="card last">
    <span>Your last drill: <strong>{topicById(settings.lastDrill)!.title}</strong></span>
    <button class="btn primary" onclick={oncontinue}>Continue</button>
  </div>
{/if}

{#if settings.progress && due}
  <div class="card last">
    <span><strong>{due}</strong> of your words {due === 1 ? 'is' : 'are'} due for review.</span>
    <button class="btn primary" onclick={onreview}>Review them</button>
  </div>
{/if}

<div class="cards">
  <a class="card tile" href={href({ page: 'learn' })}>
    <h2>Grammar</h2>
    <p>{TOPICS.filter((t) => t.learn).length} topics, from the alphabet and vowel harmony to cases and verb tenses. Read a short lesson, then drill it.</p>
  </a>
  <a class="card tile" href={href({ page: 'vocabulary' })}>
    <h2>Vocabulary</h2>
    <p>{THEMES.reduce((n, t) => n + t.words.length, 0)} everyday words in {THEMES.length} themes, from family to the steppe, with practice both ways round.</p>
  </a>
  <a class="card tile" href={href({ page: 'learn', topic: 'alphabet' })}>
    <h2>The alphabet</h2>
    <p>42 Cyrillic letters, 9 of them special to Kazakh, and the new Latin alphabet. Switch scripts at any time at the top of the page.</p>
  </a>
</div>

<section class="path card">
  <h2>New to Kazakh? Start here</h2>
  <ol>
    {#each FIRST as id (id)}
      {@const t = topicById(id)!}
      <li><a href={href({ page: 'learn', topic: id })}>{t.title}</a> <span class="muted">· {t.blurb}</span></li>
    {/each}
  </ol>
  <p class="muted small">In drills, a wrong answer comes back ten cards later; a round ends when you’ve got everything right once. Every answer is explained.</p>
</section>

<style>
  .hero h1 {
    font-size: clamp(1.7rem, 5vw, 2.4rem);
    margin: 8px 0 8px;
  }
  .lead {
    font-size: 1.1rem;
    max-width: 44rem;
  }
  .greeting {
    font-size: 1.3rem;
  }
  .last {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 12px 20px;
    margin-bottom: 16px;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
  }
  .tile {
    color: var(--text);
    text-decoration: none;
    border-top: 5px solid var(--primary-bg);
  }
  .tile:hover {
    border-color: var(--accent);
  }
  .tile h2 {
    margin: 0 0 6px;
  }
  .tile p {
    margin: 0;
  }
  .path {
    margin-top: 16px;
  }
  .path h2 {
    margin-top: 0;
  }
  .path li {
    padding: 3px 0;
  }
  .small {
    font-size: 0.9rem;
  }
</style>
