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

	const filled = $state<boolean[]>([]);

	function setFilled(index: number, value: boolean): void {
		filled[index] = value;
	}

	// Shows up to the last token that's left, ignoring the one being removed
	function collapse(removed: number): void {
		revealed = Math.max(
			0,
			filled.findLastIndex((value, index) => value && index !== removed),
		);
	}
</script>

{#each {length: slots} as _, index (index)}
	<TokenInput {host} {index} {revealed} {reveal} {collapse} {setFilled} last={index === slots - 1} />
{/each}
