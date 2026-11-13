<script lang="ts">
  /**
   * "Hear it": a native recording when there is one (credited), else the computer voice (labelled). If neither file
   * exists, says so. Plays only when pressed (or `autoplay` in the listening drill).
   */
  import { audioFor } from '../lib/audio.ts';
  let { text, icon = false, credit = true, autoplay = false, label = 'Hear it' }: { text: string; icon?: boolean; credit?: boolean; autoplay?: boolean; label?: string } = $props();
  const src = $derived(audioFor(text));
  let status = $state<'idle' | 'playing' | 'missing'>('idle');
  let audio: HTMLAudioElement | null = null;
  let played = $state(false);

  export function play(rate = 1) {
    audio?.pause();
    audio = new Audio(src.url);
    audio.playbackRate = rate;
    audio.onended = () => (status = 'idle');
    audio.onerror = () => (status = 'missing');
    status = 'playing';
    played = true;
    audio.play().catch(() => {
      if (status === 'playing') status = 'idle';
    });
  }
  $effect(() => {
    void text;
    status = 'idle';
    played = false;
    if (autoplay) play();
    return () => audio?.pause();
  });
</script>

<span class="hear" class:icon>
  <button type="button" class="btn quiet hear-btn" class:playing={status === 'playing'} aria-label={icon ? `Hear ${text}` : undefined} title={icon ? `Hear ${text}` : undefined} disabled={status === 'missing'} onclick={() => play()}>
    <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor" /><path d="M13 7a4 4 0 0 1 0 6M15.5 4.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
    {#if !icon}{status === 'missing' ? 'No audio yet' : label}{/if}
  </button>
  {#if credit && played && status !== 'missing'}
    <span class="credit">
      {#if src.native}Recorded by {src.native.author} (<a href={src.native.page} rel="noopener" target="_blank">Wikimedia Commons</a>, {#if src.native.licenceUrl}<a href={src.native.licenceUrl} rel="noopener" target="_blank">{src.native.licence}</a>{:else}{src.native.licence}{/if})
      {:else}Computer voice, not a native speaker (Piper, trained on <a href="https://github.com/IS2AI/Kazakh_TTS" rel="noopener" target="_blank">ISSAI KazakhTTS2</a>, CC BY 4.0){/if}
    </span>
  {/if}
</span>

<style>
  .hear {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 8px;
  }
  .hear-btn {
    color: var(--accent);
    font-weight: 700;
    padding: 0.3em 0.7em;
    min-height: 38px;
  }
  .icon .hear-btn {
    min-height: 32px;
    min-width: 32px;
    padding: 0 6px;
  }
  .hear-btn.playing {
    background: var(--accent-soft);
  }
  .credit {
    font-size: 0.8rem;
    color: var(--muted);
  }
</style>
