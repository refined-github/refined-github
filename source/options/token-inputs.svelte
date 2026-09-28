<script lang="ts">
	import TokenInput from './token-input.svelte';

	const {host}: {host?: string} = $props();
	// "3 tokens ought to be enough for anyone"
	// Donate $30 to unlock 4 -- or just build locally
	const slots = 3;
	let revealed = $state(0);

	function reveal(index: number): void {
		revealed = Math.max(revealed, index);
	}
</script>

{#each {length: slots} as _, index (index)}
	<TokenInput {host} {index} {revealed} {reveal} last={index === slots - 1} />
{/each}
