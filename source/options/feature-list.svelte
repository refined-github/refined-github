<script lang="ts">
	import {featuresMeta, importedFeatures} from '../feature-data.js';
	import {getLocalHotfixes} from '../helpers/hotfix.js';

	import FeatureItem from './feature-item.svelte';

	let filterText = $state('');
	const hotfixesPromise = getLocalHotfixes();

	// Pre-filter valid imported features
	const activeFeatures = featuresMeta.filter(feature =>
		importedFeatures.includes(feature.id)
	);
</script>

<p>
	<input
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

{#await hotfixesPromise then fixes}
	<div class="js-features">
		{#each activeFeatures as feature (feature.id)}
			{@const searchText = `${feature.id} ${feature.description}`.toLowerCase()}
			{@const keywords = filterText
			.toLowerCase()
			.replaceAll(/\W/g, ' ')
			.split(/\s+/)
			.filter(Boolean)}

			{@const hotfixIssue = fixes.find(([hotfixId]) => hotfixId === feature.id)?.[1]}

			<div
				data-text={searchText}
				hidden={keywords.some(word => !searchText.includes(word))}
			>
				<FeatureItem
					id={feature.id}
					description={feature.description}
					screenshot={feature.screenshot}
					hotfixIssue={hotfixIssue}
				/>
			</div>
		{/each}
	</div>
{/await}
