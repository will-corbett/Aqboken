<script lang="ts">
  import { CASES, PERSONS, POSS_PERSONS, type Case, type Person } from '../shared/kazakh.ts';
  import { THEMES } from '../data/words.ts';
  import { CASE_NAME, PERSON_NAME } from '../lib/labels.ts';
  import { href } from '../lib/router.ts';
  import { TOPICS, topicById } from '../lib/topics.ts';
  import type { Settings } from '../lib/settings.ts';
  import Kz from './Kz.svelte';

  let { settings = $bindable(), loading, error, onstart, due = 0 }: { settings: Settings; loading: boolean; error: string; onstart: () => void; due?: number } = $props();
  const t = $derived(topicById(settings.mode)!);
  const CASE_OPTS = CASES.filter((c) => c !== 'nom');

  function toggle<T>(list: T[], x: T): T[] {
    return list.includes(x) ? list.filter((y) => y !== x) : [...list, x];
  }
  const empty = $derived(
    (settings.mode === 'cases' && !settings.cases.cases.length) ||
      (settings.mode === 'pronouns' && !settings.pronouns.cases.length) ||
      (settings.mode === 'possessive' && !settings.possessive.persons.length) ||
      (settings.mode === 'copula' && !settings.copula.persons.length) ||
      (settings.mode === 'present' && !settings.present.persons.length) ||
      (settings.mode === 'past' && !settings.past.persons.length) ||
      (settings.mode === 'vocab' && !settings.vocab.themes.length) ||
      (settings.mode === 'listen' && !settings.listen.themes.length) ||
      ((settings.mode === 'continuous' || settings.mode === 'future' || settings.mode === 'want' || settings.mode === 'imperative' || settings.mode === 'perfect' || settings.mode === 'habitual' || settings.mode === 'conditional' || settings.mode === 'can') && !settings[settings.mode].persons.length) ||
      (settings.mode === 'time' && !settings.time.kinds.length) ||
      (settings.mode === 'mixed' && !settings.mixed.topics.length) ||
      (settings.mode === 'posscases' && (!settings.posscases.persons.length || !settings.posscases.cases.length)),
  );
</script>

{#snippet persons(list: Person[], all: readonly Person[], set: (l: Person[]) => void)}
  <fieldset>
    <legend>Who</legend>
    <div class="opts">
      {#each all as p (p)}
        <label class="opt"><input type="checkbox" checked={list.includes(p)} onchange={() => set(toggle(list, p))} /> {PERSON_NAME[p]}</label>
      {/each}
    </div>
  </fieldset>
{/snippet}
{#snippet caseList(list: Case[], set: (l: Case[]) => void)}
  <fieldset>
    <legend>Cases</legend>
    <div class="opts">
      {#each CASE_OPTS as c (c)}
        <label class="opt"><input type="checkbox" checked={list.includes(c)} onchange={() => set(toggle(list, c))} /> {CASE_NAME[c].en} <span class="muted">({CASE_NAME[c].meaning})</span></label>
      {/each}
    </div>
  </fieldset>
{/snippet}
{#snippet radios(legend: string, value: string, options: [string, string][], set: (v: string) => void)}
  <fieldset>
    <legend>{legend}</legend>
    <div class="opts">
      {#each options as [v, label] (v)}
        <label class="opt"><input type="radio" name={legend} checked={value === v} onchange={() => set(v)} /> {label}</label>
      {/each}
    </div>
  </fieldset>
{/snippet}

<section class="setup">
  <p class="crumbs"><a href={href({ page: 'drill' })}>Drill</a> · {t.group}</p>
  <h1>{t.title} <span class="kk-title"><Kz text={t.kk} script={settings.script} /></span></h1>
  <p>{t.blurb} {#if t.learn}<a href={href({ page: 'learn', topic: t.id })}>Read the Learn page</a> first if it’s new.{/if}</p>

  <form
    class="card"
    onsubmit={(e) => {
      e.preventDefault();
      onstart();
    }}
  >
    {#if settings.mode === 'alphabet'}
      {@render radios('Direction', settings.alphabet.direction, [['toLatin', 'Cyrillic → Latin'], ['toCyrillic', 'Latin → Cyrillic']], (v) => (settings.alphabet.direction = v as 'toLatin'))}
    {:else if settings.mode === 'cases'}
      {@render caseList(settings.cases.cases, (l) => (settings.cases.cases = l))}
      {@render radios('Number', settings.cases.number, [['sg', 'Singular'], ['pl', 'Plural'], ['both', 'Both']], (v) => (settings.cases.number = v as 'sg'))}
    {:else if settings.mode === 'pronouns'}
      {@render caseList(settings.pronouns.cases, (l) => (settings.pronouns.cases = l))}
    {:else if settings.mode === 'possessive'}
      {@render persons(settings.possessive.persons, POSS_PERSONS, (l) => (settings.possessive.persons = l as typeof settings.possessive.persons))}
    {:else if settings.mode === 'copula'}
      {@render persons(settings.copula.persons, PERSONS, (l) => (settings.copula.persons = l))}
    {:else if settings.mode === 'present' || settings.mode === 'past'}
      {@const m = settings.mode}
      {@render persons(settings[m].persons, PERSONS, (l) => (settings[m].persons = l))}
      {@render radios('Positive or negative', settings[m].polarity, [['pos', 'Positive'], ['neg', 'Negative'], ['both', 'Both']], (v) => (settings[m].polarity = v as 'pos'))}
    {:else if settings.mode === 'translate'}
      {@render radios('Direction', settings.translate.direction, [['en-kk', 'English → Kazakh'], ['kk-en', 'Kazakh → English'], ['both', 'Both']], (v) => (settings.translate.direction = v as 'en-kk'))}
      <p class="muted small">Real sentences from Tatoeba. An exact match is marked right; otherwise you compare yours with the original and mark it yourself.</p>
    {:else if settings.mode === 'build'}
      <p class="muted small">Real sentences from Tatoeba with their words shuffled. The original order is marked right; any other order you mark yourself, since Kazakh word order has some freedom.</p>
    {:else if settings.mode === 'fix'}
      <p class="muted small">Real sentences with one verb changed to the wrong person. Tap it and type the right form.</p>
    {:else if settings.mode === 'mixed'}
      <fieldset>
        <legend>Topics to mix (each uses its own settings)</legend>
        <div class="opts">
          {#each TOPICS.filter((t) => t.learn) as t (t.id)}
            <label class="opt"><input type="checkbox" checked={settings.mixed.topics.includes(t.id)} onchange={() => (settings.mixed.topics = toggle(settings.mixed.topics, t.id))} /> {t.title}</label>
          {/each}
        </div>
      </fieldset>
    {:else if settings.mode === 'can'}
      {@render persons(settings.can.persons, PERSONS, (l) => (settings.can.persons = l))}
      {@render radios('Positive or negative', settings.can.polarity, [['pos', 'Can'], ['neg', 'Can’t'], ['both', 'Both']], (v) => (settings.can.polarity = v as 'pos'))}
    {:else if settings.mode === 'time'}
      <fieldset>
        <legend>What to practise</legend>
        <div class="opts">
          {#each [['time', 'The time (07:30)'], ['at', 'At a time (at 07:30)'], ['ordinal', 'Ordinals (1st, 2nd …)'], ['date', 'Dates (25 December)']] as [k, label] (k)}
            <label class="opt"><input type="checkbox" checked={settings.time.kinds.includes(k as 'time')} onchange={() => (settings.time.kinds = toggle(settings.time.kinds, k as 'time'))} /> {label}</label>
          {/each}
        </div>
      </fieldset>
    {:else if settings.mode === 'continuous' || settings.mode === 'future' || settings.mode === 'want' || settings.mode === 'imperative' || settings.mode === 'perfect' || settings.mode === 'habitual' || settings.mode === 'conditional'}
      {@const m = settings.mode}
      {@render persons(settings[m].persons, PERSONS, (l) => (settings[m].persons = l))}
    {:else if settings.mode === 'posscases'}
      {@render persons(settings.posscases.persons, POSS_PERSONS, (l) => (settings.posscases.persons = l as typeof settings.posscases.persons))}
      {@render caseList(settings.posscases.cases, (l) => (settings.posscases.cases = l))}
    {:else if settings.mode === 'numbers'}
      {@render radios('Numbers', settings.numbers.range, [['to10', '0–10'], ['to100', '11–100'], ['to1000', '101–999'], ['years', 'Years (1900–2030)']], (v) => (settings.numbers.range = v as 'to10'))}
      {@render radios('Direction', settings.numbers.direction, [['write', 'Digits → words'], ['read', 'Words → digits']], (v) => (settings.numbers.direction = v as 'write'))}
    {:else if settings.mode === 'listen'}
      {@render radios('What to do', settings.listen.kind, [['meaning', 'Choose the meaning'], ['dictation', 'Write what you hear']], (v) => (settings.listen.kind = v as 'meaning'))}
      <fieldset>
        <legend>Themes</legend>
        <div class="opts">
          {#each THEMES as th (th.id)}
            <label class="opt"><input type="checkbox" checked={settings.listen.themes.includes(th.id)} onchange={() => (settings.listen.themes = toggle(settings.listen.themes, th.id))} /> {th.title} <span class="muted">{th.level}</span></label>
          {/each}
        </div>
      </fieldset>
      <p class="muted small">Most words are read by a computer voice (it says so when it plays); a few are native recordings.</p>
    {:else if settings.mode === 'vocab'}
      {#if settings.progress}
        {@render radios('Words', settings.vocab.source, [['themes', 'From themes'], ['mine', `My words that are due (${due})`]], (v) => (settings.vocab.source = v as 'themes'))}
      {/if}
      {@render radios('Direction', settings.vocab.direction, [['recognise', 'Kazakh → English (choose)'], ['recall', 'English → Kazakh (type)']], (v) => (settings.vocab.direction = v as 'recognise'))}
      <fieldset hidden={settings.progress && settings.vocab.source === 'mine'}>
        <legend>Themes</legend>
        <div class="opts">
          {#each THEMES as th (th.id)}
            <label class="opt"><input type="checkbox" checked={settings.vocab.themes.includes(th.id)} onchange={() => (settings.vocab.themes = toggle(settings.vocab.themes, th.id))} /> {th.title} <span class="muted">{th.level}</span></label>
          {/each}
        </div>
      </fieldset>
    {/if}

    {@render radios('Questions', String(settings.count), [['10', '10'], ['20', '20'], ['30', '30'], ['0', 'Unlimited']], (v) => (settings.count = Number(v)))}

    {#if error}<p class="error" role="alert">{error}</p>{/if}
    <button class="btn primary start" type="submit" disabled={loading || empty}>{empty ? 'Choose at least one option' : 'Start'}</button>
  </form>
</section>

<style>
  .crumbs {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
  }
  h1 {
    margin: 6px 0 8px;
  }
  .kk-title {
    display: block;
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--muted);
  }
  fieldset {
    border: 0;
    padding: 0;
    margin: 0 0 18px;
  }
  legend {
    font-weight: 700;
    margin-bottom: 6px;
  }
  .opts {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
  }
  .opt {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface-2);
    cursor: pointer;
  }
  .opt input {
    accent-color: var(--accent);
  }
  .start {
    min-width: 160px;
  }
  .small {
    font-size: 0.9rem;
  }
  .error {
    color: var(--wrong);
  }
</style>
