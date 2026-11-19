<script lang="ts">
	import abbreviateNumber from '../helpers/abbreviate-number.js';

	import type {Readable} from 'svelte/store';

	const {counter}: {counter?: Readable<number | string | undefined>} = $props();
</script>

{#if $counter !== undefined}
	<span class="Counter">{
		typeof $counter === 'number' ? abbreviateNumber($counter) : $counter
	}</span>
{/if}
