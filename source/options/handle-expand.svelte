<script lang="ts">
	import {$ as expectElement, $optional as querySelector} from 'select-dom';
	import {onMount} from 'svelte';

	let host: HTMLDivElement;

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
		const details = expectElement('details', host);
		details.addEventListener('toggle', onToggle);

		return () => {
			details.removeEventListener('toggle', onToggle);
		};
	});
</script>

<div bind:this={host} style="display: contents">
	<slot />
</div>
