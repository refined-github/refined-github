<svelte:options
	customElement={{
		tag: 'feature-count',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import {featuresMeta} from '../feature-data.js';

	let totalCount = $state(0);
	let uncheckedCount = $state(0);
	let isInitialized = $state(false);

	const totalFeatures = featuresMeta.length + 25;

	function updateCount(): void {
		// eslint-disable-next-line select-dom/prefer -- Optional
		const checkboxes = document.querySelectorAll('input.feature-checkbox');
		totalCount = checkboxes.length;

		// Don't calculate if the features list hasn't finished rendering yet
		if (totalCount === 0) {
			return;
		}

		uncheckedCount = [...checkboxes].filter(checkbox => !checkbox.checked).length;
		isInitialized = true;
	}

	const offCountText = $derived.by(() => {
		if (!isInitialized || uncheckedCount === 0) {
			return '';
		}

		if (uncheckedCount === totalCount) {
			return '(JS off… are you breaking up with me?)';
		}

		return `(${uncheckedCount} off)`;
	});

	$effect(() => {
		// Run initial check after component mounts
		updateCount();

		// Global delegation replacement for standard checkbox clicks
		const handleChange = (event: Event) => {
			const target = event.target as HTMLElement;
			if (target?.classList.contains('feature-checkbox')) {
				updateCount();
			}
		};

		// Listen to global state for now
		globalThis.addEventListener('change', handleChange);
		globalThis.addEventListener('rgh:update-count', updateCount);

		return () => {
			globalThis.removeEventListener('change', handleChange);
			globalThis.removeEventListener('rgh:update-count', updateCount);
		};
	});
</script>

: {totalFeatures} {offCountText}
