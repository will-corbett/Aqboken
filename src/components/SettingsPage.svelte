<script lang="ts">
  import type { Settings } from '../lib/settings.ts';
  import Kz from './Kz.svelte';
  import { href } from '../lib/router.ts';
  let { settings = $bindable(), onprogress }: { settings: Settings; onprogress: (on: boolean) => void } = $props();
</script>

<h1>Settings</h1>
<p class="muted">Kept in this browser only.</p>
<section class="card">
  <h2>Script</h2>
  <p>Kazakh is written in Cyrillic today. A Latin alphabet (approved in 2021) is being introduced gradually. You can type answers in either.</p>
  <div class="opts">
    {#each [['cyrl', 'Cyrillic'], ['latn', 'Latin'], ['both', 'Both']] as [v, label] (v)}
      <label class="opt"><input type="radio" name="script" checked={settings.script === v} onchange={() => (settings.script = v as Settings['script'])} /> {label}</label>
    {/each}
  </div>
  <p class="sample">Example: <Kz text="Қазақстан" script={settings.script} /></p>
</section>
<section class="card">
  <h2>Keyboard</h2>
  <label class="opt"><input type="checkbox" bind:checked={settings.keyboard} /> Show the on-screen Kazakh keyboard in drills</label>
</section>
<section class="card">
  <h2>Your progress</h2>
  <p>If you turn this on, Aqböken remembers, for each drill, how many rounds you’ve played, your last score and the date; and for each word you practise, when it’s next due for review (“my words”). Only in this browser: nothing is sent anywhere. Turning it off deletes it. See it on <a href={href({ page: 'progress' })}>Your progress</a>.</p>
  <label class="opt"><input type="checkbox" checked={settings.progress} onchange={(e) => onprogress((e.currentTarget as HTMLInputElement).checked)} /> Keep my progress</label>
</section>
<section class="card">
  <h2>Theme</h2>
  <select bind:value={settings.theme}>
    <option value="aqboken">Aqböken</option>
    <option value="system">System</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</section>

<style>
  .card {
    margin-bottom: 12px;
  }
  h2 {
    margin-top: 0;
    font-size: 1.15rem;
  }
  .opts {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
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
  .sample {
    font-size: 1.2rem;
  }
</style>
