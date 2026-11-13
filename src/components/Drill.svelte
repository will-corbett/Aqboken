<script lang="ts">
  import { tick } from 'svelte';
  import { RETRY_GAP, answer, clearedCount, current, endRound, extendRound, isFinished, type Round } from '../lib/queue.ts';
  import { checkAnswer, type CheckResult } from '../lib/check.ts';
  import { speakText, type Question } from '../lib/questions.ts';
  import Hear from './Hear.svelte';
  import Sentence from './Sentence.svelte';
  import { sentenceFor, sentenceWithForm } from '../lib/sentences.ts';
  import type { Settings } from '../lib/settings.ts';
  import { toLatin } from '../shared/script.ts';
  import Keyboard from './Keyboard.svelte';
  import Kz from './Kz.svelte';

  let {
    round: initial,
    settings = $bindable(),
    more,
    onfinish,
  }: { round: Round<Question>; settings: Settings; more: ((n: number) => Question[]) | null; onfinish: (r: Round<Question>) => void } = $props();

  // svelte-ignore state_referenced_locally
  let round = $state(initial);
  let phase = $state<'answering' | 'feedback'>('answering');
  let input = $state('');
  let typed = $state('');
  let result = $state<CheckResult | null>(null);
  let wasRetry = $state(false);
  let field = $state<HTMLInputElement>();
  let nextButton = $state<HTMLButtonElement>();
  let choiceButtons = $state<HTMLButtonElement[]>([]);
  let player = $state<Hear>();

  const entry = $derived(current(round));
  const q = $derived(entry?.q);
  const unlimited = $derived(!!more);
  const total = $derived(round.entries.length);
  const cleared = $derived(clearedCount(round));
  const script = $derived(settings.script);
  /** Kazakh text shown in the reader's script (for choice buttons and the solution line). */
  /** An example sentence: for vocabulary and listening, the word's; elsewhere only one using exactly the answer. */
  const example = $derived.by(() => {
    if (!q) return undefined;
    if (q.mode === 'vocab' || q.mode === 'listen') return sentenceFor(q.answerLang === 'kk' ? q.answer : (q.listen ?? q.prompt));
    return q.answerLang === 'kk' && q.promptLang === 'kk' ? sentenceWithForm(q.prompt, q.answer) : undefined;
  });
  const show = (t: string) => (script === 'latn' ? toLatin(t) : t);

  async function focusField() {
    await tick();
    if (phase === 'feedback') nextButton?.focus();
    else if (q?.choices) choiceButtons[0]?.focus();
    else field?.focus({ preventScroll: true });
  }
  $effect(() => {
    void q?.key;
    void phase;
    focusField();
  });

  function grade(value: string) {
    if (!q || phase !== 'answering') return;
    typed = value;
    result = value ? checkAnswer(q, value) : { correct: false };
    wasRetry = (entry?.attempts ?? 0) > 0;
    phase = 'feedback';
  }
  function submit(e: Event) {
    e.preventDefault();
    if (phase === 'answering') {
      if (!input.trim() || q?.choices) return;
      grade(input);
    } else next();
  }
  function next() {
    if (!result) return;
    let r = answer(round, result.correct, typed);
    if (unlimited && r.queue.length < 5 && more) r = extendRound(r, more(10));
    round = r;
    input = '';
    typed = '';
    result = null;
    phase = 'answering';
    if (isFinished(r)) onfinish(r);
  }
  function end() {
    onfinish(endRound(round));
  }
  function onKey(e: KeyboardEvent) {
    if (!q?.choices || phase !== 'answering') return;
    const n = Number(e.key);
    if (n >= 1 && n <= q.choices.length) {
      e.preventDefault();
      grade(q.choices[n - 1]!);
    }
  }
  function insert(s: string) {
    input += s;
    field?.focus();
  }
</script>

<svelte:window onkeydown={onKey} />

{#if q && entry}
  <section class="drill" aria-labelledby="prompt">
    <div class="bar">
      <p class="count">{#if unlimited}<strong>{cleared}</strong> cleared <span class="muted">· unlimited round</span>{:else}<strong>{cleared}</strong> of {total} cleared{/if}</p>
      {#if phase === 'answering' ? entry.attempts > 0 : wasRetry}<span class="retry">Retry</span>{/if}
      <button class="btn end" type="button" onclick={end}>End round</button>
    </div>
    {#if !unlimited}<div class="progress" aria-hidden="true"><span style="width: {(100 * cleared) / total}%"></span></div>{:else}<div class="gap"></div>{/if}

    <div class="card prompt">
      <p class="task">{q.task}</p>
      {#if q.listen}
        <h1 id="prompt" class="visually-hidden">Listen</h1>
        <div class="listen">
          {#key q.key}<Hear bind:this={player} text={q.listen} autoplay label="Play again" credit={phase === 'feedback'} />{/key}
          <button type="button" class="btn quiet" onclick={() => player?.play(0.7)}>Slower</button>
        </div>
      {:else}
        <h1 id="prompt" class="word" class:en={q.promptLang === 'en'}>
          {#if q.promptLang === 'kk'}<Kz text={q.prompt} {script} stacked />{:else}{q.prompt}{/if}
        </h1>
      {/if}
      {#if q.gloss}<p class="gloss">{q.gloss}</p>{/if}
      {#if q.cue}<p class="cue">“{q.cue}”</p>{/if}

      <form class="answer" onsubmit={submit} autocomplete="off">
        {#if q.choices}
          {#if q.frame}
            <p class="frame"><Kz text={q.frame[0]} {script} /> <span class="blank" class:right={phase === 'feedback'}>{phase === 'feedback' ? show(q.answer) : '___'}</span><Kz text={q.frame[1]} {script} /></p>
          {/if}
          <div class="choices" class:two={q.choices.length === 2} class:six={q.choices.length === 6} role="group" aria-label="Choose the answer">
            {#each q.choices as c, i (c)}
              <button
                type="button"
                class="btn choice"
                class:picked={phase === 'feedback' && typed === c}
                class:correct-choice={phase === 'feedback' && (c === q.answer || q.accept?.includes(c))}
                disabled={phase === 'feedback'}
                lang={q.choiceLang === 'kk' ? 'kk' : 'en'}
                onclick={() => grade(c)}
                bind:this={choiceButtons[i]}><span class="num" aria-hidden="true">{i + 1}</span> {q.choiceLang === 'kk' ? show(c) : c}</button
              >
            {/each}
          </div>
        {:else}
          <label class="frame">
            <span class="visually-hidden">Your answer</span>
            {#if q.frame?.[0]}<span class="frame-text"><Kz text={q.frame[0]} {script} /></span>{/if}
            <input
              bind:this={field}
              bind:value={input}
              class:right={phase === 'feedback' && result?.correct}
              class:wrong={phase === 'feedback' && !result?.correct}
              readonly={phase === 'feedback'}
              inputmode={settings.keyboard && q.answerLang === 'kk' ? 'none' : q.answerLang === 'digits' ? 'numeric' : 'text'}
              lang={q.answerLang === 'kk' ? 'kk' : 'en'}
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              aria-describedby="feedback"
            />
            {#if q.frame?.[1]}<span class="frame-text"><Kz text={q.frame[1]} {script} /></span>{/if}
          </label>
        {/if}
        <div class="actions">
          {#if phase === 'answering'}
            {#if !q.choices}<button class="btn primary" type="submit" disabled={!input.trim()}>Check</button>{/if}
            <button class="btn quiet" type="button" onclick={() => grade('')}>I don’t know</button>
            {#if q.choices}<span class="muted hint">or press 1–{q.choices.length}</span>{/if}
            {#if !q.choices && q.answerLang === 'kk'}
              <button class="btn quiet" type="button" aria-pressed={settings.keyboard} onclick={() => { settings.keyboard = !settings.keyboard; field?.focus(); }}>
                <span aria-hidden="true">⌨</span> {settings.keyboard ? 'Hide keyboard' : 'Kazakh keyboard'}
              </button>
            {/if}
          {:else}
            <button class="btn primary" type="submit" bind:this={nextButton}>{!unlimited && result && isFinished(answer(round, result.correct, typed)) ? 'See results' : 'Next'}</button>
            <span class="muted hint">or press Enter</span>
          {/if}
        </div>
      </form>
      {#if settings.keyboard && phase === 'answering' && !q.choices && q.answerLang === 'kk'}
        <Keyboard oninsert={insert} onbackspace={() => (input = input.slice(0, -1))} {script} />
      {/if}
      {#if phase === 'answering' && !q.choices && q.answerLang === 'kk'}
        <p class="type-note muted">Type in Cyrillic or in the Latin alphabet.</p>
      {/if}
    </div>

    <div id="feedback" role="status" aria-live="polite">
      {#if phase === 'feedback' && result}
        <div class="card feedback fade-in" class:ok={result.correct} class:bad={!result.correct}>
          <p class="verdict">{result.correct ? 'Correct' : typed ? 'Not quite' : 'Answer'}</p>
          <p class="solution">
            {#if q.answerLang === 'kk'}<strong><Kz text={q.answer} {script} mark={q.base ?? ''} /></strong>{#each q.accept ?? [] as a (a)}<span class="muted"> or </span><strong><Kz text={a} {script} /></strong>{/each}
            {:else if q.choiceLang === 'kk'}<strong>{show(q.answer)}</strong>
            {:else}<strong>{q.answer}</strong>{/if}
          </p>
          {#if !result.correct && typed}
            <p class="typed">
              You {q.choices ? 'chose' : 'typed'} <span lang="kk">{q.choiceLang === 'kk' ? show(typed) : typed}</span>{#if result.otherForm}, which is the <strong>{result.otherForm}</strong>{/if}.
              {#if !wasRetry}It comes back {round.queue.length > RETRY_GAP ? `in ${RETRY_GAP} cards` : 'at the end of the round'}.{/if}
            </p>
          {:else if !result.correct}
            <p class="typed">It comes back {round.queue.length > RETRY_GAP ? `in ${RETRY_GAP} cards` : 'at the end of the round'}.</p>
          {/if}
          {#if q.listen && q.answerLang !== 'kk'}<p class="heard">You heard <strong><Kz text={q.listen} {script} /></strong></p>{/if}
          <p class="explain">{#if script === 'latn'}{toLatin(q.explain)}{:else}{q.explain}{/if}</p>
          {#if !q.listen && speakText(q)}<p class="hear-line"><Hear text={speakText(q)!} /></p>{/if}
          {#if example}<Sentence row={example} {script} />{/if}
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .bar {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .count {
    margin: 0;
  }
  .retry {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--wrong);
    border: 1px solid currentColor;
    border-radius: 999px;
    padding: 1px 8px;
  }
  .end {
    margin-left: auto;
    min-height: 38px;
    padding: 0.3em 0.9em;
    font-weight: 400;
  }
  .gap {
    height: 14px;
  }
  .progress {
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    margin: 6px 0 14px;
    overflow: hidden;
  }
  .progress span {
    display: block;
    height: 100%;
    background: var(--gold, var(--primary-bg));
  }
  @media (prefers-reduced-motion: no-preference) {
    .progress span {
      transition: width 200ms ease;
    }
  }
  .task {
    margin: 0 0 6px;
    font-weight: 700;
    color: var(--accent);
  }
  .word {
    font-family: var(--serif);
    font-size: clamp(2rem, 8vw, 2.8rem);
    margin: 4px 0 0;
    overflow-wrap: anywhere;
  }
  .word.en {
    font-family: var(--sans);
    font-size: clamp(1.6rem, 6vw, 2.1rem);
  }
  .word :global(.latin-sub) {
    font-size: 0.45em;
  }
  .gloss {
    margin: 2px 0 0;
    color: var(--muted);
  }
  .cue {
    margin: 8px 0 0;
    font-style: italic;
  }
  .answer {
    margin-top: 18px;
  }
  .frame {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    font-size: 1.5rem;
    margin: 0 0 10px;
  }
  .frame-text {
    font-family: var(--serif);
  }
  .blank {
    font-family: var(--serif);
    border-bottom: 2px solid var(--border);
    min-width: 3ch;
    text-align: center;
  }
  .blank.right {
    color: var(--correct);
    border-color: var(--correct);
  }
  input {
    flex: 1 1 10ch;
    min-width: 0;
    max-width: 100%;
    font-family: var(--serif);
    font-size: 1.5rem;
    padding: 6px 10px;
    border: 2px solid var(--border);
    border-radius: 10px;
    background: var(--surface-2);
  }
  input:focus-visible {
    outline: none;
    border-color: var(--focus);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  input.right {
    border-color: var(--correct);
    background: var(--correct-soft);
  }
  input.wrong {
    border-color: var(--wrong);
    background: var(--wrong-soft);
  }
  .choices {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .choices.six {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 480px) {
    .choices:not(.six):not(.two) {
      grid-template-columns: 1fr;
    }
  }
  .choice {
    justify-content: flex-start;
    font-weight: 400;
    text-align: left;
    min-height: 52px;
  }
  .choice:lang(kk) {
    font-family: var(--serif);
    font-size: 1.2rem;
  }
  .num {
    font: 700 0.8rem var(--sans);
    color: var(--muted);
    min-width: 1.2em;
  }
  .choice.correct-choice {
    border-color: var(--correct);
    background: var(--correct-soft);
    opacity: 1;
  }
  .choice.picked:not(.correct-choice) {
    border-color: var(--wrong);
    background: var(--wrong-soft);
    opacity: 1;
  }
  .actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }
  .hint {
    font-size: 0.9rem;
  }
  .type-note {
    margin: 10px 0 0;
    font-size: 0.85rem;
  }
  .feedback {
    margin-top: 14px;
    border-left: 5px solid var(--border);
  }
  .feedback.ok {
    border-left-color: var(--correct);
  }
  .feedback.bad {
    border-left-color: var(--wrong);
  }
  .verdict {
    margin: 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.85rem;
  }
  .ok .verdict {
    color: var(--correct);
  }
  .bad .verdict {
    color: var(--wrong);
  }
  .solution {
    font-size: 1.6rem;
    margin: 4px 0;
    font-family: var(--serif);
  }
  .typed {
    margin: 4px 0;
  }
  .explain {
    margin: 8px 0 0;
  }
  .hear-line {
    margin: 8px 0 0;
  }
  .heard {
    margin: 4px 0;
    font-size: 1.2rem;
  }
  .listen {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin: 8px 0;
  }
  .listen :global(.hear-btn) {
    font-size: 1.15rem;
    min-height: 52px;
    padding: 0.4em 1.1em;
    border-color: var(--accent);
  }
</style>
