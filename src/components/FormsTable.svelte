<script lang="ts">
  /** A Learn page's table of forms, made by the rules in src/shared/kazakh.ts (each checked against Wiktionary). */
  import {
    CASES,
    PERSONS,
    POSS_PERSONS,
    PRONOUN,
    PRONOUN_CASES,
    PRONOUN_GEN,
    SUFFIX,
    caseForm,
    copula,
    numberWords,
    past,
    pastNeg,
    plural,
    possessive,
    present,
    presentNeg,
    questionParticle,
    voiceFinal,
    POSTPOSITIONS,
    continuous,
    imperative,
    intention,
    possessiveCase,
    want,
    can,
    comparative,
    conditional,
    habitualPast,
    ordinalWords,
    perfect,
    timeWords,
    type Person,
  } from '../shared/kazakh.ts';
  import { APPROXIMATE, toLatin, type Script } from '../shared/script.ts';
  import { ALL_WORDS } from '../data/words.ts';
  import { nounOptions } from '../data/exceptions.ts';
  import { ALPHABET, KAZAKH_LETTERS } from '../lib/questions.ts';
  import { CASE_NAME } from '../lib/labels.ts';
  import Kz from './Kz.svelte';

  let { kind, words, script }: { kind: string; words: string[]; script: Script } = $props();

  const en = (kk: string) => ALL_WORDS.find((w) => w.kk === kk)?.en ?? '';
  const stemOf = (inf: string) => ALL_WORDS.find((w) => w.kk === inf && w.pos === 'v')?.stem ?? inf.replace(/у$/, '');
  const motion = (inf: string) => !!ALL_WORDS.find((w) => w.kk === inf)?.motion;
  const VERB_FN = { present, presentNeg, past, pastNeg, want, imperative, intention, perfect, habitual: habitualPast, conditional, can: (st: string, p: Person) => can(st, p), cannot: (st: string, p: Person) => can(st, p, true) } as Record<string, (s: string, p: Person) => string>;
  const IMP_LABEL: Record<Person, string> = { '1sg': 'let me', '2sg': 'сен', '2sgf': 'сіз', '3': 'let him/her', '1pl': 'let’s', '2pl': 'сендер', '2plf': 'сіздер' };
  const RULE_ROWS: [string, string][] = [
    ['V', 'a vowel'],
    ['G', 'р, й, у, и'],
    ['L', 'л'],
    ['N', 'м, н, ң'],
    ['Z', 'з, ж'],
    ['K', 'a voiceless consonant (п, т, к, қ, с, ш …)'],
  ];
  const ruleTable = $derived(kind === 'rule' ? (SUFFIX as Record<string, Record<string, readonly [string, string]>>)[words[0] ?? ''] : undefined);
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="table-scroll" tabindex="0" role="region" aria-label="Table (scroll sideways if it is wider than the screen)">
  {#if kind === 'plural' || kind === 'question'}
    <table class="forms">
      <thead><tr><th>Word</th><th>Meaning</th><th>{kind === 'plural' ? 'Plural' : 'Question'}</th></tr></thead>
      <tbody>
        {#each words as w (w)}
          <tr>
            <td><Kz text={w} {script} /></td>
            <td class="muted">{en(w)}</td>
            <td>
              {#if kind === 'plural'}<Kz text={plural(w, nounOptions(w))} mark={w} {script} />
              {:else}<Kz text={`Бұл ${w} ${questionParticle(w)}?`} mark={`Бұл ${w} `} {script} />{/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if kind === 'cases'}
    {#each words as w (w)}
      {@const o = nounOptions(w)}
      {@const pl = plural(w, o)}
      <table class="forms">
        <caption><Kz text={w} {script} /> <span class="muted">· {en(w)}</span></caption>
        <thead><tr><th>Case</th><th>Meaning</th><th>Singular</th><th>Plural</th></tr></thead>
        <tbody>
          {#each CASES as c (c)}
            <tr>
              <th scope="row">{CASE_NAME[c].en} <span class="muted small"><Kz text={CASE_NAME[c].kk} {script} /></span></th>
              <td class="muted">{CASE_NAME[c].meaning}</td>
              <td><Kz text={caseForm(w, c, o)} mark={w} {script} /></td>
              <td><Kz text={caseForm(pl, c, { harmony: o.harmony })} mark={w} {script} /></td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/each}
  {:else if kind === 'possessive'}
    <table class="forms">
      <thead><tr><th></th>{#each words as w (w)}<th><Kz text={w} {script} /> <span class="muted small">{en(w)}</span></th>{/each}</tr></thead>
      <tbody>
        {#each POSS_PERSONS as p (p)}
          <tr>
            <th scope="row"><Kz text={PRONOUN_GEN[p]} {script} /></th>
            {#each words as w (w)}
              {@const o = nounOptions(w)}
              <td><Kz text={possessive(w, p, o)} mark={o.possStem ?? (o.noVoicing ? w : voiceFinal(w))} {script} /></td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if kind === 'copula'}
    <table class="forms">
      <thead><tr><th></th>{#each words as w (w)}<th><Kz text={w} {script} /> <span class="muted small">{en(w)}</span></th>{/each}</tr></thead>
      <tbody>
        {#each PERSONS as p (p)}
          <tr>
            <th scope="row"><Kz text={PRONOUN[p]} {script} /></th>
            {#each words as w (w)}<td><Kz text={copula(w, p)} mark={w} {script} /></td>{/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if kind === 'comparative'}
    <table class="forms">
      <thead><tr><th>Word</th><th>Meaning</th><th>Comparative</th></tr></thead>
      <tbody>
        {#each words as w (w)}<tr><td><Kz text={w} {script} /></td><td class="muted">{en(w)}</td><td><Kz text={comparative(w)} mark={w === 'кішкентай' ? '' : w} {script} /></td></tr>{/each}
      </tbody>
    </table>
  {:else if kind === 'ordinals'}
    <table class="forms">
      <tbody>
        {#each words as n (n)}<tr><th scope="row">{n}</th><td><Kz text={numberWords(Number(n))} {script} /></td><td><Kz text={ordinalWords(Number(n))} {script} /></td></tr>{/each}
      </tbody>
    </table>
  {:else if kind === 'times'}
    <table class="forms">
      <thead><tr><th>Time</th><th>It is …</th><th>At …</th></tr></thead>
      <tbody>
        {#each words as t (t)}
          {@const [h, m] = t.split(':').map(Number) as [number, number]}
          <tr><th scope="row">{t}</th><td><Kz text={timeWords(h, m === 30 ? 30 : 0)} {script} /></td><td><Kz text={timeWords(h, m === 30 ? 30 : 0, true)} {script} /></td></tr>
        {/each}
      </tbody>
    </table>
  {:else if kind === 'continuous'}
    <table class="forms">
      <thead><tr><th></th>{#each words as w (w)}<th><Kz text={w} {script} /> <span class="muted small">{en(w)}</span></th>{/each}</tr></thead>
      <tbody>
        {#each PERSONS as p (p)}
          <tr>
            <th scope="row"><Kz text={PRONOUN[p]} {script} /></th>
            {#each words as w (w)}<td><Kz text={continuous(stemOf(w), p, { motion: motion(w) })} mark={stemOf(w)} {script} /></td>{/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if kind === 'posscases'}
    {#each words as w (w)}
      {@const o = nounOptions(w)}
      <table class="forms">
        <caption><Kz text={w} {script} /> <span class="muted">· {en(w)}</span></caption>
        <thead><tr><th>Case</th>{#each POSS_PERSONS as p (p)}<th><Kz text={PRONOUN_GEN[p]} {script} /></th>{/each}</tr></thead>
        <tbody>
          {#each CASES as c (c)}
            <tr>
              <th scope="row">{CASE_NAME[c].en}</th>
              {#each POSS_PERSONS as p (p)}<td><Kz text={possessiveCase(w, p, c, o)} mark={possessive(w, p, o)} {script} /></td>{/each}
            </tr>
          {/each}
        </tbody>
      </table>
    {/each}
  {:else if kind === 'postpositions'}
    <table class="forms">
      <thead><tr><th>Postposition</th><th>Meaning</th><th>Takes</th><th>Example</th></tr></thead>
      <tbody>
        {#each POSTPOSITIONS as pp (pp.word)}
          <tr>
            <td><Kz text={pp.word} {script} /></td>
            <td class="muted">{pp.en}</td>
            <td>{pp.case === 'nom' ? 'the plain form' : CASE_NAME[pp.case].en.toLowerCase()}</td>
            <td><Kz text={`${caseForm(words[0] ?? 'мектеп', pp.case)} ${pp.word}`} mark={words[0] ?? 'мектеп'} {script} /></td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if kind in VERB_FN}
    <table class="forms">
      <thead><tr><th></th>{#each words as w (w)}<th><Kz text={w} {script} /> <span class="muted small">{en(w)}</span></th>{/each}</tr></thead>
      <tbody>
        {#each PERSONS as p (p)}
          <tr>
            <th scope="row">{#if kind === 'imperative'}{IMP_LABEL[p]}{:else if kind === 'want'}<Kz text={{ '1sg': 'менің', '2sg': 'сенің', '2sgf': 'сіздің', '3': 'оның', '1pl': 'біздің', '2pl': 'сендердің', '2plf': 'сіздердің' }[p]} {script} />{:else}<Kz text={PRONOUN[p]} {script} />{/if}</th>
            {#each words as w (w)}<td><Kz text={VERB_FN[kind]!(stemOf(w), p)} mark={kind === 'can' || kind === 'cannot' ? '' : stemOf(w)} {script} /></td>{/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if kind === 'pronouns'}
    <table class="forms">
      <thead><tr><th>Case</th>{#each Object.keys(PRONOUN_CASES) as p (p)}<th><Kz text={p} {script} /></th>{/each}</tr></thead>
      <tbody>
        {#each CASES as c (c)}
          <tr>
            <th scope="row">{CASE_NAME[c].en}</th>
            {#each Object.values(PRONOUN_CASES) as forms, i (i)}<td><Kz text={forms[c]} {script} /></td>{/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if kind === 'numbers'}
    <table class="forms">
      <tbody>
        {#each words as n (n)}<tr><th scope="row">{n}</th><td><Kz text={numberWords(Number(n))} {script} /></td></tr>{/each}
      </tbody>
    </table>
  {:else if kind === 'alphabet'}
    <div class="letters">
      {#each ALPHABET as c (c)}
        <div class="letter" class:special={KAZAKH_LETTERS.has(c)}>
          <span class="cyr" lang="kk">{c.toUpperCase()} {c}</span>
          <span class="latn" lang="kk-Latn">{toLatin(c.toUpperCase()) || '–'}{APPROXIMATE.has(c) && toLatin(c) ? '*' : ''}</span>
        </div>
      {/each}
    </div>
  {:else if kind === 'rule' && ruleTable}
    <table class="forms">
      <thead><tr><th>After a word ending in…</th><th>Back vowels</th><th>Front vowels</th></tr></thead>
      <tbody>
        {#each RULE_ROWS as [cls, text] (cls)}
          <tr><th scope="row">{text}</th><td><Kz text={'-' + ruleTable[cls]![0]} {script} /></td><td><Kz text={'-' + ruleTable[cls]![1]} {script} /></td></tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  caption {
    text-align: left;
    font-weight: 700;
    padding-bottom: 4px;
  }
  .small {
    font-size: 0.85em;
    font-weight: 400;
  }
  .letters {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
    gap: 6px;
    margin: 12px 0;
  }
  .letter {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
  }
  .letter.special {
    background: var(--mark);
    border-color: var(--gold, var(--border));
  }
  .cyr {
    font: 700 1.3rem var(--serif);
  }
  .latn {
    color: var(--muted);
  }
</style>
