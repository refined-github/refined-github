<script lang="ts">
	import TokenInput from './token-input.svelte';

	const {host}: {host?: string} = $props();
	// "3 tokens ought to be enough for anyone"
	const slots = 3;
	// Donate $30 to unlock -- or just build locally
	// const slots = 4;
	let revealed = $state(0);

	function reveal(index: number): void {
		revealed = Math.max(revealed, index);
	}

	function collapse(index: number): void {
		revealed = Math.min(revealed, index - 1);
	}
</script>

{#each {length: slots} as _, index (index)}
	<TokenInput {host} {index} {revealed} {reveal} {collapse} last={index === slots - 1} />
{/each}
