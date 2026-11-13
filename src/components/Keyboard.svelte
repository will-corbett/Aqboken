<script lang="ts">
  /** The on-screen keyboard: the Kazakh letters first (the ones missing from a Russian layout), then the rest. */
  import type { Script } from '../shared/script.ts';
  let { oninsert, onbackspace, script }: { oninsert: (s: string) => void; onbackspace: () => void; script: Script } = $props();
  const CYR = [
    ['ә', 'ғ', 'қ', 'ң', 'ө', 'ұ', 'ү', 'һ', 'і'],
    ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
    ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
    ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'ъ', 'ё'],
  ];
  const LAT = [
    ['ä', 'ğ', 'ı', 'ñ', 'ö', 'ş', 'ū', 'ü'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'c', 'v', 'b', 'n', 'm'],
  ];
  const rows = $derived(script === 'latn' ? LAT : CYR);
</script>

<div class="kb" role="group" aria-label="On-screen keyboard">
  {#each rows as row, r (r)}
    <div class="row" class:special={r === 0}>
      {#each row as k (k)}
        <button type="button" class="key" onmousedown={(e) => e.preventDefault()} onclick={() => oninsert(k)}>{k}</button>
      {/each}
      {#if r === rows.length - 1}<button type="button" class="key wide" aria-label="Backspace" onmousedown={(e) => e.preventDefault()} onclick={onbackspace}>⌫</button>{/if}
    </div>
  {/each}
  <div class="row"><button type="button" class="key space" onmousedown={(e) => e.preventDefault()} onclick={() => oninsert(' ')}>space</button></div>
</div>

<style>
  .kb {
    margin-top: 14px;
    display: grid;
    gap: 5px;
  }
  .row {
    display: flex;
    justify-content: center;
    gap: 4px;
    flex-wrap: wrap;
  }
  .key {
    min-width: 34px;
    min-height: 40px;
    padding: 0 6px;
    border: 1px solid var(--border);
    border-radius: 7px;
    background: var(--surface-2);
    font: 1.05rem var(--serif);
    color: var(--text);
    cursor: pointer;
  }
  .special .key {
    background: var(--accent-soft);
    font-weight: 700;
  }
  .key:hover {
    border-color: var(--accent);
  }
  .wide {
    min-width: 54px;
  }
  .space {
    min-width: 200px;
    font-family: var(--sans);
    font-size: 0.9rem;
    color: var(--muted);
  }
  @media (max-width: 420px) {
    .key {
      min-width: 28px;
      padding: 0 3px;
    }
  }
</style>
