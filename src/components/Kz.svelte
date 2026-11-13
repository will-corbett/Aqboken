<script lang="ts">
  /** Kazakh text in the reader's script; with "both", Cyrillic with the Latin beneath (stacked) or beside it. */
  import { toLatin, type Script } from '../shared/script.ts';
  let { text, script, stacked = false, mark = '' }: { text: string; script: Script; stacked?: boolean; mark?: string } = $props();
  // `mark`: the base (before the ending); the rest of the word is highlighted.
  const split = (t: string) => {
    if (!mark) return [t, ''];
    let i = 0;
    while (i < mark.length && i < t.length && mark[i] === t[i]) i++;
    return [t.slice(0, i), t.slice(i)];
  };
  const shown = $derived(script === 'latn' ? toLatin(text) : text);
  const parts = $derived.by(() => {
    const [a, b] = split(text);
    return script === 'latn' ? [toLatin(a!), toLatin(b!)] : [a!, b!];
  });
</script>

<span class="kz" lang={script === 'latn' ? 'kk-Latn' : 'kk'}
  >{#if mark && parts[1]}{parts[0]}<mark class="sfx">{parts[1]}</mark>{:else}{shown}{/if}{#if script === 'both'}{#if stacked}<span class="latin-sub" lang="kk-Latn">{toLatin(text)}</span>{:else}<span class="lat" lang="kk-Latn"> {toLatin(text)}</span>{/if}{/if}</span
>

<style>
  .kz {
    font-family: var(--serif);
  }
  .lat {
    margin-left: 0.35em;
    font-family: var(--sans);
    font-size: 0.85em;
    color: var(--muted);
  }
</style>
