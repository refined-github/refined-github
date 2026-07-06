<svelte:options
	customElement={{
		tag: 'handle-expand',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import {$ as expectElement, $optional as querySelector} from 'select-dom';
	import {onMount} from 'svelte';

	function onToggle(event: Event): void {
		const details = event.currentTarget as HTMLDetailsElement;

		const rect = details.getBoundingClientRect();
		if (rect.bottom > window.innerHeight || rect.top < 0) {
			details.scrollIntoView({behavior: 'smooth', block: 'nearest'});
		}

		if (details.open) {
			querySelector('input, textarea', details)?.focus({preventScroll: true});
		}
	}

	onMount(() => {
		expectElement('details', $host()).addEventListener(
			'toggle',
			onToggle,
		);
	});
</script>

<slot />
