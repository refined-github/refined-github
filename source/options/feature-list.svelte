<script lang="ts">
	import {$$ as querySelectorAll} from 'select-dom';

	import {featuresMeta, importedFeatures} from '../feature-data.js';
	import {brokenFeatures} from '../helpers/hotfix.js';
	import FeatureItem from './feature-item.svelte';

	let filterText = $state('');
	let list = $state<HTMLElement>();
	const keywords = $derived(
		filterText
			.toLowerCase()
			.replaceAll(/\W/g, ' ')
			.split(/\s+/)
			.filter(Boolean),
	);
	// This will attempt to load the hotfixes because we do want an up-to-date options page
	const hotfixesPromise = brokenFeatures.get();

	// Pre-filter valid imported features
	const activeFeatures = featuresMeta.filter(feature =>
		importedFeatures.includes(feature.id)
	);

	// Highlight the matches after the DOM has been filtered
	$effect(() => {
		// Firefox <140 lacks the Custom Highlight API
		if (!list || !('highlights' in CSS)) {
			return;
		}

		const ranges: Range[] = [];
		for (
			const element of querySelectorAll(
				':scope .feature-item:not([hidden]) :is(.feature-name, .description)',
				list,
			)
		) {
			const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
			for (let node = walker.nextNode(); node; node = walker.nextNode()) {
				const text = node.textContent!.toLowerCase();
				for (const keyword of keywords) {
					for (
						let index = text.indexOf(keyword);
						index !== -1;
						index = text.indexOf(keyword, index + keyword.length)
					) {
						const range = new Range();
						range.setStart(node, index);
						range.setEnd(node, index + keyword.length);
						ranges.push(range);
					}
				}
			}
		}

		CSS.highlights.set('feature-search', new Highlight(...ranges));

		return () => CSS.highlights.delete('feature-search');
	});
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
	<div class="js-features" bind:this={list}>
		{#each activeFeatures as feature (feature.id)}
			{@const searchText = `${feature.id} ${feature.description}`.toLowerCase()}
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
