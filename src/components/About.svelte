<script lang="ts">
  import { ALL_WORDS } from '../data/words.ts';
  import { NOT_IN_WIKTIONARY, WIKTIONARY_ERRORS } from '../data/exceptions.ts';
  import { RECORDINGS } from '../lib/audio.ts';
  import { SENTENCES } from '../lib/sentences.ts';
</script>

<h1>About Aqböken</h1>
<p><strong>Aqböken</strong> (<span lang="kk">ақбөкен</span>) is Kazakh for the saiga antelope, which roams the steppe of Kazakhstan; it’s the animal in the logo. The site was called Körti until November 2026.</p>
<p>Aqböken helps you learn Kazakh grammar and everyday words: short explanations, tables of real forms, and drills that explain every answer. It is free, has no accounts and no analytics. Settings stay in your browser; so does your progress, if you turn it on: how each drill went, and the words you’re learning with when each is next due. Nothing is sent anywhere.</p>

<h2>Where the Kazakh comes from</h2>
<p>Kazakh endings follow sound rules: vowel harmony and the sound a word ends in. Aqböken makes forms with those rules, and checks them against <a href="https://en.wiktionary.org" rel="noopener">Wiktionary</a>’s Kazakh tables (via <a href="https://kaikki.org" rel="noopener">kaikki.org</a>, CC BY-SA 4.0):</p>
<ul>
  <li>Every noun and verb in our lists that Wiktionary has a table for matches it form by form.</li>
  <li>Across all of Wiktionary’s Kazakh noun tables (about 4,600), the rules agree with every form for 96% of nouns; most of the rest are Russian loanwords, which we override one by one.</li>
  <li>{ALL_WORDS.length} words are in our lists. {Object.keys(NOT_IN_WIKTIONARY).length} basic words Wiktionary doesn’t have yet are kept, each with a note, and {Object.keys(WIKTIONARY_ERRORS).length} clear error in Wiktionary is set aside.</li>
</ul>
<p>Meanings, explanations and Learn pages are our own. A native speaker hasn’t yet reviewed the site: if something is wrong, please tell us.</p>

<h2>Reading texts</h2>
<p>The stories on the Reading page are by Ybyrai Altynsarin (1841–1889), from his Kazakh reader of 1879: public domain. The text is taken unchanged from <a href="https://wikisource.org" rel="noopener">Wikisource</a> (transcription CC BY-SA 4.0) at a fixed revision, except for a few clear typing slips, which each page lists. Every word is explained from our word lists, Wiktionary, the rules, or our own notes, and each explanation says which; our notes and the questions are our own and await a native speaker’s review.</p>

<h2>Example sentences</h2>
<p>Example sentences come from <a href="https://tatoeba.org" rel="noopener">Tatoeba</a> (CC BY 2.0 FR), each linked to its page and credited to its contributor. Tatoeba has few Kazakh sentences with English translations (about 620), so {Object.keys(SENTENCES).length} of our words have one. Every match was read: sentences where the word is used in another sense, or that are crude, unkind, political or misspelt, are left out. They are volunteers’ sentences, not checked by us for style.</p>

<h2>The Latin alphabet</h2>
<p>The Latin letters follow the alphabet approved in April 2021. Letters used only in Russian loanwords (ё, ц, ч, щ, э, ю, я, ъ, ь) have no letter of their own; Aqböken writes their sounds, which is an approximation.</p>

<h2>Audio</h2>
<p>Open recordings of Kazakh by native speakers are still rare. Where one exists for a word ({Object.keys(RECORDINGS).length} words so far), Aqböken plays it; everything else is read by a <strong>computer voice</strong>, and the page says which you’re hearing.</p>
<ul>
  <li>Native recordings: from <a href="https://lingualibre.org" rel="noopener">Lingua Libre</a> via Wikimedia Commons, hosted with the site:
    <ul class="recs">
      {#each Object.entries(RECORDINGS) as [word, r] (word)}
        <li><span lang="kk">{word}</span>: {r.author}, <a href={r.page} rel="noopener">file</a>, {#if r.licenceUrl}<a href={r.licenceUrl} rel="noopener">{r.licence}</a>{:else}{r.licence}{/if}</li>
      {/each}
    </ul>
  </li>
  <li>Computer voice: <a href="https://github.com/OHF-Voice/piper1-gpl" rel="noopener">Piper</a> with the Kazakh voice kk_KZ-issai-high (MIT), trained on <a href="https://github.com/IS2AI/Kazakh_TTS" rel="noopener">KazakhTTS2</a> by ISSAI, Nazarbayev University (CC BY 4.0). It is made when the site is built; it can stress or pronounce a word wrongly, so trust a native recording over it.</li>
</ul>

<h2>Fonts</h2>
<p>PT Sans and PT Serif (ParaType, SIL Open Font License), which include every Kazakh letter.</p>

<style>
  .recs {
    columns: 2 16rem;
    font-size: 0.9rem;
  }
</style>
