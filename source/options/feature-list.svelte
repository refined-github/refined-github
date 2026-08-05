<script lang="ts">
	import {featuresMeta, importedFeatures} from '../feature-data.js';
	import {getHotfixes} from '../helpers/hotfix.js';

	import FeatureItem from './feature-item.svelte';

	let filterText = $state('');
	const hotfixesPromise = getHotfixes();

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
				class="feature-item"
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

<style>
	.feature-item:not([hidden]) {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0 0.4em;
		padding: 0.5em 0;
	}

	.feature-item:first-of-type {
		padding-top: 0;
	}

	.feature-item:target {
		outline: solid 2px transparent;
		border-radius: var(--border-radius);
		animation-name: blink-border;
		animation-duration: 1.5s;
		animation-iteration-count: 2;
		scroll-margin-top: 64px;
	}
</style>
