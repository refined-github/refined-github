<svelte:options
	customElement={{
		tag: 'feature-list',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import {featuresMeta, importedFeatures} from '../feature-data.js';
	import {getLocalHotfixes} from '../helpers/hotfix.js';

	// Component State
	let filterText = $state('');
	let hotfixes = $state(getLocalHotfixes());

	const filteredFeatures = $derived(
		hotfixes &&
		featuresMeta
		.filter(feature => importedFeatures.includes(feature.id))
		.map(feature => {
			const searchText = `${feature.id} ${feature.description}`.toLowerCase();
			const keywords = filterText
				.toLowerCase()
				.replaceAll(/\W/g, ' ')
				.split(/\s+/)
				.filter(Boolean);

			// Feature is visible if search input is empty or matches all entered keywords
			const isVisible = keywords.keywords.every(word => searchText.includes(word));

			return {
				...feature,
				searchText,
				isVisible,
				hotfixIssue: hotfixes.get(feature.id)
			};
		})
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
	<small style:opacity="80%">
		Use the "Identify feature" section below if you can't find what you're
		looking for.
	</small>
</p>

<div class="js-features">
	{#each filteredFeatures as feature (feature.id)}
		<feature-item
			data-text={feature.searchText}
			id={feature.id}
			description={feature.description}
			screenshot={feature.screenshot}
			hidden={!feature.isVisible || null}
			hotfixIssue={feature.hotfixIssue}
		></feature-item>
	{/each}
</div>
