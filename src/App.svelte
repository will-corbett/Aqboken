<script lang="ts">
  import About from './components/About.svelte';
  import Drill from './components/Drill.svelte';
  import EndScreen from './components/EndScreen.svelte';
  import Home from './components/Home.svelte';
  import LearnIndex from './components/LearnIndex.svelte';
  import LearnPage from './components/LearnPage.svelte';
  import SettingsPage from './components/SettingsPage.svelte';
  import Setup from './components/Setup.svelte';
  import WordsIndex from './components/WordsIndex.svelte';
  import WordsTheme from './components/WordsTheme.svelte';
  import { loadSettings, saveSettings, type Settings } from './lib/settings.ts';
  import { href, navigate, parsePath, type Route } from './lib/router.ts';
  import { pageTitle } from './lib/pageMeta.ts';
  import { createRound, score, type Round } from './lib/queue.ts';
  import { drawer, pool, type Question } from './lib/questions.ts';
  import { mulberry32 } from './lib/rng.ts';
  import { clearProgress, loadProgress, recordRound, saveProgress, today, type Progress } from './lib/progress.ts';
  import { addWords, clearWords, dueWords, loadWords, review as scheduleWords, saveWords, type MyWords } from './lib/mywords.ts';
  import ProgressPage from './components/ProgressPage.svelte';
  import StartPage from './components/StartPage.svelte';
  import LevelTest from './components/LevelTest.svelte';
  import Culture from './components/Culture.svelte';
  import SearchPage from './components/SearchPage.svelte';
  import PathsPage from './components/PathsPage.svelte';
  import { ALL_WORDS } from './data/words.ts';
  import { isMode, topicById } from './lib/topics.ts';
  import { SITE_BASE } from './shared/site.ts';
  import type { Script } from './shared/script.ts';
  import type { Word } from './data/words.ts';

  const initialRoute = parsePath(location.pathname);
  const initialSettings = loadSettings();
  if (initialRoute.page === 'drill' && initialRoute.mode && isMode(initialRoute.mode)) initialSettings.mode = initialRoute.mode;
  let settings = $state<Settings>(initialSettings);
  let route = $state<Route>(initialRoute);
  let screen = $state<'setup' | 'drill' | 'end'>('setup');
  let round = $state<Round<Question> | null>(null);
  let more = $state<((n: number) => Question[]) | null>(null);
  let error = $state('');
  let progress = $state<Progress>(loadProgress());
  let myWords = $state<MyWords>(loadWords());
  const due = $derived(settings.progress ? dueWords(myWords, today()) : []);
  /** A theme's words to practise (from a Vocabulary page), kept for "Another round". */
  let practice = $state<{ words: Word[]; direction: 'recognise' | 'recall' } | null>(null);

  $effect(() => {
    saveSettings($state.snapshot(settings) as Settings);
    const root = document.documentElement;
    if (settings.theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = settings.theme;
  });
  $effect(() => {
    document.title = pageTitle(route);
  });

  function applyRoute(next: Route) {
    if (next.page === 'drill') {
      screen = 'setup';
      practice = null;
      if (next.mode && isMode(next.mode)) settings.mode = next.mode;
    }
    route = next;
    if (next.page === 'start') settings.guideSeen = true;
    window.scrollTo({ top: 0 });
  }
  $effect(() => {
    const onPop = () => applyRoute(parsePath(location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  });

  /** Links inside the site change page without reloading. */
  function onLinkClick(e: MouseEvent) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith(SITE_BASE)) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    navigate(url.pathname + url.search);
  }

  function seed(): number {
    const p = new URLSearchParams(location.search).get('seed');
    return p ? Number(p) : Math.floor(Math.random() * 2 ** 31);
  }

  function start() {
    error = '';
    const rng = mulberry32(seed());
    const s = $state.snapshot(settings) as Settings;
    // “My words that are due”: the vocabulary drill on those words only.
    const mine = !practice && s.mode === 'vocab' && s.vocab.source === 'mine' ? due.map((w) => ALL_WORDS.find((x) => x.kk === w)).filter((w) => !!w) : undefined;
    if (mine && !mine.length) {
      error = 'None of your words are due today. Come back tomorrow, or practise a theme.';
      return;
    }
    const all = practice ? pool('vocab', { ...s, vocab: { ...s.vocab, direction: practice.direction } }, rng, practice.words) : pool(s.mode, s, rng, mine);
    const draw = drawer(all, rng);
    const unlimited = s.count === 0 && !practice;
    const qs = draw(practice ? practice.words.length : mine ? mine.length : unlimited ? 15 : s.count);
    if (!qs.length) {
      error = 'No questions match these settings.';
      return;
    }
    more = unlimited && !mine ? draw : null;
    round = createRound(qs);
    screen = 'drill';
    if (!practice) settings.lastDrill = s.mode;
    settings.guideSeen = true;
    window.scrollTo({ top: 0 });
  }

  function practise(words: Word[], direction: 'recognise' | 'recall') {
    settings.mode = 'vocab';
    navigate(href({ page: 'drill', mode: 'vocab' }));
    practice = { words, direction };
    start();
  }

  function continueDrill() {
    if (settings.lastDrill) settings.mode = settings.lastDrill;
    navigate(href({ page: 'drill', mode: settings.mode }));
    start();
  }

  function finish(r: Round<Question>) {
    round = r;
    screen = 'end';
    const sc = score(r);
    if (settings.progress && sc.attempted && !practice) {
      progress = recordRound(progress, settings.mode, sc.percent);
      saveProgress(progress);
    }
    // Opt-in: every vocabulary and listening word answered is scheduled for review (src/lib/mywords.ts).
    if (settings.progress) {
      const results = r.entries.filter((e) => e.attempts > 0 && /^(vocab|listen):/.test(e.q.key)).map((e) => ({ word: e.q.key.replace(/^(vocab|listen):/, ''), right: e.firstTryCorrect === true }));
      if (results.length) {
        myWords = scheduleWords(myWords, results, today());
        saveWords(myWords);
      }
    }
  }

  function setProgress(on: boolean) {
    settings.progress = on;
    if (!on) {
      clearProgress();
      clearWords();
      progress = {};
      myWords = {};
    }
  }

  function addToMyWords(list: string[]) {
    myWords = addWords(myWords, list, today());
    saveWords(myWords);
  }
  function removeWord(w: string) {
    const { [w]: _, ...rest } = myWords;
    myWords = rest;
    saveWords(myWords);
  }
  function reviewDue() {
    settings.mode = 'vocab';
    settings.vocab.source = 'mine';
    navigate(href({ page: 'drill', mode: 'vocab' }));
    start();
  }

  function setScript(s: Script) {
    settings.script = s;
  }

  const narrow = $derived(route.page === 'drill' || route.page === 'settings' || route.page === 'about' || route.page === 'progress' || route.page === 'start' || route.page === 'paths' || route.page === 'test' || route.page === 'search');
  const navItems: [Route['page'], string][] = [
    ['learn', 'Learn'],
    ['drill', 'Drill'],
    ['vocabulary', 'Vocabulary'],
    ['test', 'Test'],
    ['culture', 'Culture'],
  ];

  function onWindowKey(e: KeyboardEvent) {
    // "/" opens the search from anywhere, unless you're typing.
    const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
    if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && route.page !== 'search') {
      e.preventDefault();
      navigate(href({ page: 'search' }));
    }
  }
</script>

<svelte:document onclick={onLinkClick} />
<svelte:window onkeydown={onWindowKey} />

<a class="skip" href="#main">Skip to content</a>
<div class="shell">
  <header class="top">
    <a class="brand" href={href({ page: 'home' })} aria-label="Aqböken, home">
      <img src="{import.meta.env.BASE_URL}brand/aqboken-128.png" alt="" width="44" height="44" />
      <span>Aqböken</span>
    </a>
    <nav class="nav" aria-label="Main">
      {#each navItems as [page, label] (page)}
        <a href={href({ page } as Route)} aria-current={route.page === page ? 'page' : undefined}>{label}</a>
      {/each}
    </nav>
    <a class="btn quiet search-btn" href={href({ page: 'search' })} aria-label="Search the site" title="Search the site (press /)" aria-current={route.page === 'search' ? 'page' : undefined}
      ><svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2" /><path d="M13 13l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg></a
    >
    <div class="script" role="group" aria-label="Script">
      {#each [['cyrl', 'Кирил'], ['latn', 'Latyn'], ['both', 'Both']] as [v, label] (v)}
        <button type="button" aria-pressed={settings.script === v} onclick={() => setScript(v as Script)} title={v === 'cyrl' ? 'Cyrillic' : v === 'latn' ? 'Latin (2021 alphabet)' : 'Cyrillic and Latin'}>{label}</button>
      {/each}
    </div>
  </header>

  {#if !settings.betaNoteHidden}
    <aside class="beta" aria-label="Beta">
      <p><strong>Aqböken is new.</strong> The Kazakh is checked against Wiktionary but not yet by a native speaker: if you spot a mistake, please say.</p>
      <button type="button" class="beta-close" aria-label="Hide this note" onclick={() => (settings.betaNoteHidden = true)}>×</button>
    </aside>
  {/if}

  <main id="main" class:narrow>
    {#if route.page === 'home'}
      <Home {settings} {progress} {myWords} oncontinue={continueDrill} due={due.length} onreview={reviewDue} ongotit={() => (settings.guideSeen = true)} />
    {:else if route.page === 'learn' && route.topic}
      <LearnPage topic={route.topic} {settings} />
    {:else if route.page === 'learn' || (route.page === 'drill' && !route.mode)}
      <LearnIndex {settings} {progress} />
    {:else if route.page === 'vocabulary' && route.theme}
      <WordsTheme id={route.theme} script={settings.script} onpractise={practise} progressOn={settings.progress} {myWords} onadd={addToMyWords} />
    {:else if route.page === 'vocabulary'}
      <WordsIndex script={settings.script} />
    {:else if route.page === 'settings'}
      <SettingsPage bind:settings onprogress={setProgress} />
    {:else if route.page === 'culture'}
      <Culture />
    {:else if route.page === 'search'}
      {#key route}<SearchPage script={settings.script} />{/key}
    {:else if route.page === 'test'}
      <LevelTest bind:settings />
    {:else if route.page === 'start'}
      <StartPage {settings} />
    {:else if route.page === 'paths'}
      <PathsPage bind:settings {progress} {myWords} />
    {:else if route.page === 'progress'}
      <ProgressPage {settings} {progress} {myWords} {due} onprogress={setProgress} onremove={removeWord} onreview={reviewDue} />
    {:else if route.page === 'about'}
      <About />
    {:else if route.page === 'drill' && route.mode && !isMode(route.mode)}
      <p>There is no drill called “{route.mode}”. <a href={href({ page: 'drill' })}>All drills</a></p>
    {:else if screen === 'drill' && round}
      {#key round}
        <Drill {round} bind:settings {more} onfinish={finish} />
      {/key}
    {:else if screen === 'end' && round}
      <EndScreen {round} script={settings.script} onagain={start} onsettings={() => { screen = 'setup'; practice = null; }} />
    {:else}
      <Setup bind:settings loading={false} {error} onstart={start} due={due.length} />
    {/if}
  </main>

  <footer class="foot">
    <a class="btn quiet" href={href({ page: 'start' })}>Start here</a>
    <a class="btn quiet" href={href({ page: 'paths' })}>Learning paths</a>
    <a class="btn quiet" href={href({ page: 'progress' })}>Your progress</a>
    <a class="btn quiet" href={href({ page: 'settings' })}>Settings</a>
    <a class="btn quiet" href={href({ page: 'about' })}>About &amp; sources</a>
    <label class="theme">
      Theme
      <select bind:value={settings.theme}>
        <option value="aqboken">Aqböken</option>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    <p class="credit muted">Forms checked against <a href="https://en.wiktionary.org" rel="noopener">Wiktionary</a> via kaikki.org (CC BY-SA 4.0). Example sentences: <a href="https://tatoeba.org" rel="noopener">Tatoeba</a> (CC BY 2.0 FR). Fonts: PT Sans, PT Serif (OFL).</p>
  </footer>
</div>

<style>
  .skip {
    position: absolute;
    left: -999px;
  }
  .skip:focus {
    left: 16px;
    top: 8px;
    z-index: 10;
    background: var(--surface);
    padding: 6px 10px;
  }
  .shell {
    max-width: 1000px;
    margin: 0 auto;
    padding: 12px 16px 32px;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
  .top {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 20px;
    padding: 4px 0 16px;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 1.3rem;
    color: var(--text);
    text-decoration: none;
  }
  .brand img {
    border-radius: 10px;
  }
  .nav {
    display: flex;
    gap: 4px;
  }
  .nav a {
    padding: 8px 12px;
    border-radius: 10px;
    color: var(--text);
    text-decoration: none;
    font-weight: 700;
  }
  .nav a:hover {
    background: var(--surface-2);
  }
  .nav a[aria-current='page'] {
    background: var(--primary-bg);
    color: var(--primary-text);
  }
  .search-btn {
    margin-left: auto;
    min-width: 40px;
    min-height: 40px;
    padding: 0 10px;
    color: var(--text);
  }
  .search-btn[aria-current='page'] {
    background: var(--primary-bg);
    color: var(--primary-text);
  }
  .script {
    display: inline-flex;
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    background: var(--surface);
  }
  .script button {
    border: 0;
    background: none;
    padding: 6px 10px;
    min-height: 36px;
    cursor: pointer;
    color: var(--muted);
    font-size: 0.9rem;
  }
  .script button + button {
    border-left: 1px solid var(--border);
  }
  .script button[aria-pressed='true'] {
    background: var(--accent);
    color: var(--accent-text);
    font-weight: 700;
  }
  @media (max-width: 560px) {
    .search-btn {
      margin-left: auto;
    }
    .nav {
      order: 3;
      width: 100%;
      flex-wrap: wrap;
      gap: 2px;
    }
    .nav a {
      padding: 6px 8px;
    }
  }
  main {
    flex: 1;
  }
  main.narrow {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
  }
  .beta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: -6px 0 16px;
    padding: 6px 6px 6px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-2);
    font-size: 0.9rem;
  }
  .beta p {
    margin: 0;
    flex: 1;
  }
  .beta-close {
    flex: none;
    min-width: 36px;
    min-height: 36px;
    border: 0;
    border-radius: 8px;
    background: none;
    color: var(--muted);
    font-size: 1.3rem;
    cursor: pointer;
  }
  .foot {
    margin-top: 32px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 16px;
    border-top: 1px solid var(--border);
    padding-top: 12px;
  }
  .theme {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--muted);
  }
  .credit {
    flex-basis: 100%;
    margin: 4px 0 0;
    font-size: 0.85rem;
  }
</style>
