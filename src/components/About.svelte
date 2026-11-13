<script lang="ts">
  import { ALL_WORDS } from '../data/words.ts';
  import { NOT_IN_WIKTIONARY, WIKTIONARY_ERRORS } from '../data/exceptions.ts';
</script>

<h1>About Körti</h1>
<p>Körti helps you learn Kazakh grammar and everyday words: short explanations, tables of real forms, and drills that explain every answer. It is free, has no accounts and no analytics. Settings (and progress, if you turn it on) stay in your browser.</p>

<h2>Where the Kazakh comes from</h2>
<p>Kazakh endings follow sound rules: vowel harmony and the sound a word ends in. Körti makes forms with those rules, and checks them against <a href="https://en.wiktionary.org" rel="noopener">Wiktionary</a>’s Kazakh tables (via <a href="https://kaikki.org" rel="noopener">kaikki.org</a>, CC BY-SA 4.0):</p>
<ul>
  <li>Every noun and verb in our lists that Wiktionary has a table for matches it form by form.</li>
  <li>Across all of Wiktionary’s Kazakh noun tables (about 4,600), the rules agree with every form for 96% of nouns; most of the rest are Russian loanwords, which we override one by one.</li>
  <li>{ALL_WORDS.length} words are in our lists. {Object.keys(NOT_IN_WIKTIONARY).length} basic words Wiktionary doesn’t have yet are kept, each with a note, and {Object.keys(WIKTIONARY_ERRORS).length} clear error in Wiktionary is set aside.</li>
</ul>
<p>Meanings, explanations and Learn pages are our own. A native speaker hasn’t yet reviewed the site: if something is wrong, please tell us.</p>

<h2>The Latin alphabet</h2>
<p>The Latin letters follow the alphabet approved in April 2021. Letters used only in Russian loanwords (ё, ц, ч, щ, э, ю, я, ъ, ь) have no letter of their own; Körti writes their sounds, which is an approximation.</p>

<h2>Fonts</h2>
<p>PT Sans and PT Serif (ParaType, SIL Open Font License), which include every Kazakh letter.</p>
