<script lang="ts">
  import { href } from '../lib/router.ts';
  import { TOPICS } from '../lib/topics.ts';
  import { ALL_WORDS, THEMES } from '../data/words.ts';
  import type { Settings } from '../lib/settings.ts';
  import Kz from './Kz.svelte';
  let { settings }: { settings: Settings } = $props();
</script>

<article class="start">
  <h1>Start here</h1>
  <p class="lead">Aqböken teaches Kazakh to English speakers, from your first letters to B1. Here’s what’s here and how to use it.</p>

  <h2>What’s here</h2>
  <ul>
    <li><a href={href({ page: 'learn' })}><strong>Learn</strong></a>: {TOPICS.filter((t) => t.learn).length} short lessons, each with tables of real forms, from the alphabet to “if” and “used to”.</li>
    <li><a href={href({ page: 'drill' })}><strong>Drill</strong></a>: a drill for every lesson, for vocabulary and for listening. Wrong answers come back until you get them right, and every answer is explained.</li>
    <li><a href={href({ page: 'vocabulary' })}><strong>Vocabulary</strong></a>: {ALL_WORDS.length} everyday words in {THEMES.length} themes, each with its forms, audio, and often a real example sentence.</li>
    <li><a href={href({ page: 'paths' })}><strong>Learning paths</strong></a>: a recommended route for A1, A2 and B1.</li>
    <li><a href={href({ page: 'test' })}><strong>Grammar test</strong></a>: 36 questions to find your level and what to review. If you know some Kazakh already, start here.</li>
  </ul>

  <h2>Your first hour</h2>
  <ol>
    <li>Read <a href={href({ page: 'learn', topic: 'alphabet' })}>the alphabet</a> and do its drill: Kazakh has 9 letters you won’t know from other languages.</li>
    <li>Read <a href={href({ page: 'learn', topic: 'harmony' })}>vowel harmony</a>. It’s the one rule behind every ending; once it clicks, everything else is easier.</li>
    <li>Learn the <a href={href({ page: 'vocabulary', theme: 'basics' })}>greetings</a>: <Kz text="сәлем" script={settings.script} />, <Kz text="рахмет" script={settings.script} />.</li>
    <li>Then follow the <a href={href({ page: 'paths' })}>A1 path</a>, one step at a time.</li>
  </ol>

  <h2>How drills work</h2>
  <ul>
    <li>Type your answer in Cyrillic or in Latin letters; there’s an on-screen Kazakh keyboard. Press Enter to check and Enter again for the next question. For choices, press 1–4.</li>
    <li>A wrong answer comes back ten cards later; the round ends when you’ve got everything right once. Your score is what you got right first time.</li>
    <li>If you type another real form of the word (the dative instead of the locative), the drill tells you which one it was.</li>
    <li>Press <em>Hear it</em> to listen. Some words are native recordings; the rest are a computer voice, and it says so.</li>
  </ul>

  <h2>Cyrillic or Latin?</h2>
  <p>Kazakh is written in Cyrillic today, and a Latin alphabet (approved in 2021) is being introduced gradually. Use the switch at the top of every page to read in Cyrillic, Latin, or both.</p>

  <h2>Remembering what you’ve learned</h2>
  <p>Turn on <a href={href({ page: 'progress' })}>progress</a> (it stays in your browser) and Aqböken remembers how each drill went and brings your words back for review just before you’d forget them. The paths then tick off what you’ve done.</p>

  <p><a class="btn primary" href={href({ page: 'paths' })}>Go to the learning paths →</a></p>
</article>

<style>
  .start {
    max-width: 46rem;
  }
  .lead {
    font-size: 1.1rem;
  }
  li {
    margin: 4px 0;
    line-height: 1.55;
  }
</style>
