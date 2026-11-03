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

	// Removes the row by shifting the next tokens up. All values are set before
	// any event is dispatched, so the form is never saved with a gap
	function removeAt(index: number): void {
		const values = fields.map(field => field.value);
		values.splice(index, 1);
		values.push('');

		const changed: HTMLInputElement[] = [];
		for (const [fieldIndex, field] of fields.entries()) {
			if (field.value === values[fieldIndex]) {
				continue;
			}

			field.value = values[fieldIndex]!;
			changed.push(field);
		}

		revealed = Math.max(0, values.findLastIndex(value => value.trim() !== ''));

		// Setting the value doesn't notify the form, so it's done through events
		for (const field of changed) {
			field.dispatchEvent(new InputEvent('input', {bubbles: true}));
		}
	}
</script>

{#each {length: slots} as _, index (index)}
	<TokenInput {host} {index} {revealed} {reveal} {removeAt} {registerField} last={index === slots - 1} />
{/each}
