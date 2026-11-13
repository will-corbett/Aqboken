<script lang="ts">
  /**
   * Record yourself and compare: MediaRecorder, kept in this page's memory only (never stored or sent, no speech
   * recognition). Hidden where the browser can't record.
   */
  import { onDestroy } from 'svelte';
  let { label = 'Record yourself' }: { label?: string } = $props();
  const supported = typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;
  let status = $state<'idle' | 'recording' | 'denied'>('idle');
  let url = $state<string | null>(null);
  let rec: MediaRecorder | null = null;
  let stream: MediaStream | null = null;

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      status = 'denied';
      return;
    }
    const chunks: Blob[] = [];
    rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => {
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(new Blob(chunks, { type: rec?.mimeType || 'audio/webm' }));
      stream?.getTracks().forEach((t) => t.stop());
      status = 'idle';
    };
    rec.start();
    status = 'recording';
  }
  function stop() {
    rec?.stop();
  }
  onDestroy(() => {
    rec?.state === 'recording' && rec.stop();
    stream?.getTracks().forEach((t) => t.stop());
    if (url) URL.revokeObjectURL(url);
  });
</script>

{#if supported}
  <span class="rec">
    {#if status === 'recording'}
      <button type="button" class="btn quiet on" onclick={stop}><span class="dot" aria-hidden="true"></span> Stop</button>
    {:else}
      <button type="button" class="btn quiet" onclick={start}><span aria-hidden="true">🎙</span> {url ? 'Record again' : label}</button>
    {/if}
    {#if url}<audio controls src={url} aria-label="Your recording"></audio>{/if}
    {#if status === 'denied'}<span class="muted small">The microphone isn’t available: allow it in your browser to record.</span>{/if}
  </span>
{/if}

<style>
  .rec {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 8px;
  }
  .rec .btn {
    color: var(--accent);
    font-weight: 700;
    min-height: 38px;
    padding: 0.3em 0.7em;
  }
  .on {
    background: var(--wrong-soft);
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--wrong);
  }
  audio {
    height: 36px;
    max-width: 100%;
  }
  .small {
    font-size: 0.85rem;
  }
</style>
