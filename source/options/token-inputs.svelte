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

	const fields: HTMLInputElement[] = [];

	function registerField(index: number, field: HTMLInputElement): void {
		fields[index] = field;
	}

	// Values are all set before the events, so the form is never saved with a gap
	function removeAt(removed: number): void {
		const tokens = fields
			.map(field => field.value)
			.filter((value, index) => value && index !== removed);
		revealed = Math.max(0, tokens.length - 1);

		for (const [index, field] of fields.entries()) {
			field.value = tokens[index] ?? '';
		}

		for (const field of fields) {
			field.dispatchEvent(new InputEvent('input', {bubbles: true}));
		}
	}
</script>

{#each {length: slots} as _, index (index)}
	<TokenInput
		{host}
		{index}
		{revealed}
		{reveal}
		{removeAt}
		{registerField}
		last={index === slots - 1}
	/>
{/each}
