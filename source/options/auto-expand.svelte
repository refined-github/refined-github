<svelte:options
	customElement={{
		tag: 'auto-expand',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import {
		$ as expectElement,
		$optional as querySelector,
		elementExists,
	} from 'select-dom';
	import {onMount} from 'svelte';

	function onToggle(event: Event): void {
		if (elementExists(':target')) return;

		const section = event.currentTarget as HTMLDetailsElement;

		const rect = section.getBoundingClientRect();
		if (rect.bottom > window.innerHeight || rect.top < 0) {
			section.scrollIntoView({behavior: 'smooth', block: 'nearest'});
		}

		if (section.open) {
			querySelector('input, textarea', section)?.focus({preventScroll: true});
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
