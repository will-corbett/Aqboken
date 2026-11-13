<script lang="ts">
  import { href } from '../lib/router.ts';
  import { TOPICS, topicById } from '../lib/topics.ts';
  import { nextStep } from '../lib/paths.ts';
  import { themeById as theme } from '../data/words.ts';
  import type { MyWords } from '../lib/mywords.ts';
  import type { Progress } from '../lib/progress.ts';
  import type { Settings } from '../lib/settings.ts';
  import { THEMES } from '../data/words.ts';
  import Kz from './Kz.svelte';
  let { settings, progress = {}, myWords = {}, oncontinue, due = 0, onreview, ongotit }: { settings: Settings; progress?: Progress; myWords?: MyWords; oncontinue: () => void; due?: number; onreview: () => void; ongotit: () => void } = $props();
  const next = $derived(settings.progress ? nextStep(settings.pathLevel, progress, myWords) : undefined);
</script>

{#if !settings.guideSeen}
  <section class="card new">
    <h2>New to Kazakh?</h2>
    <p>The guide shows what’s here, what to do in your first hour, and how the drills work.</p>
    <p><a class="btn primary" href={href({ page: 'start' })}>Start here</a> <button class="btn quiet" onclick={ongotit}>Got it, hide this</button></p>
  </section>
{/if}

<section class="hero">
  <img class="hero-logo" src="{import.meta.env.BASE_URL}brand/aqboken-logo.webp" alt="A saiga antelope leaping over the steppe, under the sun and mountains" width="168" height="168" />
  <h1>Learn Kazakh, one ending at a time</h1>
  <p class="lead">Kazakh builds words from a stem and a chain of endings, and each ending follows a handful of sound rules. Aqböken explains the rules simply, shows them at work in tables, and drills them until they’re automatic.</p>
  <p class="greeting"><Kz text="Қош келдіңіз!" script={settings.script} /> <span class="muted">Welcome!</span></p>
  {#if settings.guideSeen}<p class="guide-link"><a href={href({ page: 'start' })}>New here? Start with the guide</a></p>{/if}
  <p class="name muted">Aqböken (<span lang="kk">ақбөкен</span>) is Kazakh for the saiga, the antelope of the steppe.</p>
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

{#if next}
  <section class="card path">
    <h2>Your next step <span class="chip">{settings.pathLevel}</span></h2>
    {#if next.kind === 'topic'}
      {@const tp = topicById(next.id)!}
      <p><strong>{tp.title}</strong>: {next.why}</p>
      <p>{#if tp.learn}<a class="btn primary" href={href({ page: 'learn', topic: next.id })}>Learn</a>{/if} <a class="btn" href={href({ page: 'drill', mode: next.id })}>Drill</a> <a class="btn quiet" href={href({ page: 'paths' })}>The whole path</a></p>
    {:else}
      <p><strong>Words: {theme(next.id)?.title}</strong>: {next.why}</p>
      <p><a class="btn primary" href={href({ page: 'vocabulary', theme: next.id })}>Open the theme</a> <a class="btn quiet" href={href({ page: 'paths' })}>The whole path</a></p>
    {/if}
  </section>
{:else}
  <p class="path-line">Not sure where to begin or what’s next? Follow the <a href={href({ page: 'paths' })}>learning path</a> for your level.</p>
{/if}

<style>
  .hero::after {
    content: '';
    display: block;
    clear: both;
  }
  .hero-logo {
    float: right;
    width: 168px;
    height: 168px;
    margin: 0 0 12px 24px;
    border-radius: 24px;
  }
  @media (max-width: 560px) {
    .hero-logo {
      width: 96px;
      height: 96px;
      margin-left: 12px;
    }
  }
  .hero h1 {
    font-size: clamp(1.7rem, 5vw, 2.4rem);
    margin: 8px 0 8px;
  }
  .lead {
    font-size: 1.1rem;
    max-width: 44rem;
  }
  .name {
    font-size: 0.95rem;
    margin-top: -8px;
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
    border-top: 5px solid var(--gold, var(--primary-bg));
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
  .path-line {
    margin-top: 16px;
  }
  .new {
    margin-bottom: 16px;
    border-left: 5px solid var(--gold, var(--primary-bg));
  }
  .new h2 {
    margin: 0 0 4px;
  }
  .guide-link {
    margin: 0 0 8px;
  }
  .path h2 {
    margin-top: 0;
  }
</style>
