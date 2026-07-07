<svelte:options
	customElement={{
		tag: 'feature-list',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import {featuresMeta, importedFeatures} from '../feature-data.js';

	// Component State
	let filterText = $state('');

	// Get all valid features
	const activeFeatures = featuresMeta.filter(feature =>
		importedFeatures.includes(feature.id)
	);

	// Derive visibility based on search text
	const filteredFeatures = $derived(
		activeFeatures.map(feature => {
			const searchText = `${feature.id} ${feature.description}`.toLowerCase();
			const keywords = filterText
				.toLowerCase()
				.replaceAll(/\W/g, ' ')
				.split(/\s+/)
				.filter(Boolean);

			// Feature is visible if search input is empty or matches all entered keywords
			const isVisible = keywords.every(word => searchText.includes(word));

			return {
				...feature,
				searchText,
				isVisible,
			};
		}),
	);
</script>

<p>
	<input
		id="filter-features"
		type="text"
		placeholder="Find features"
		spellcheck="false"
		autocomplete="off"
		autocapitalize="off"
		bind:value={filterText}
	>
	<small style:opacity="80%">Use the "Identify feature" section below if you can't find what you're
		looking for.</small>
</p>

<div class="js-features">
	{#each filteredFeatures as feature (feature.id)}
		<feature-item
			data-text={feature.searchText}
			id={feature.id}
			description={feature.description}
			screenshot={feature.screenshot}
			hidden={!feature.isVisible || null}
		></feature-item>
	{/each}
</div>
