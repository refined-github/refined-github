<svelte:options
	customElement={{
		tag: 'feature-list',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import {featuresMeta, importedFeatures} from '../feature-data.js';
	import {getLocalHotfixes} from '../helpers/hotfix.js';
	import FeatureItem from './feature-item.svelte';

	const root = $host();
	const features = featuresMeta.filter(feature =>
		importedFeatures.includes(feature.id)
	);

	const checkboxes: Record<string, HTMLInputElement> = {};

	let hotfixes = $state(new Map<string, number>());
	let filter = $state('');
	let order = $state(features.map(feature => feature.id));
	let offCount = $state(0);

	function keywordsOf(value: string): string[] {
		return value.toLowerCase().replaceAll(/\W/g, ' ').split(/\s+/).filter(
			Boolean,
		);
	}

	const rows = $derived(
		order.map(id => {
			const feature = features.find(item => item.id === id)!;
			const text = `${feature.id} ${feature.description}`.toLowerCase();
			return {
				feature,
				issue: hotfixes.get(feature.id),
				hidden: keywordsOf(filter).some(word => !text.includes(word)),
			};
		}),
	);

	function updateOffCount(): void {
		let count = 0;
		for (const checkbox of Object.values(checkboxes)) {
			if (!checkbox.checked) {
				count++;
			}
		}

		offCount = count;
	}

	function sort(): void {
		const sorted = features.toSorted(
			(a, b) =>
				`${a.id} ${a.description}`.localeCompare(`${b.id} ${b.description}`),
		);
		const groups = Object.groupBy(
			sorted,
			feature =>
				hotfixes.has(feature.id)
					? 'broken'
					: checkboxes[feature.id].checked
					? 'on'
					: 'off',
		);

		order = [...groups.off ?? [], ...groups.broken ?? [], ...groups.on ?? []].map(
			feature => feature.id,
		);
	}

	root.addEventListener('sync', () => {
		sort();
		updateOffCount();
	});

	// eslint-disable-next-line unicorn/prefer-top-level-await -- bug
	getLocalHotfixes().then(entries => {
		hotfixes = new Map(
			entries
				.filter(([feature]) => importedFeatures.includes(feature))
				.map(([feature, issue]) => [feature, Number(issue)] as const),
		);
		sort();
		root.dispatchEvent(new Event('ready'));
	});
</script>

<details>
	<summary>
		<strong class="features-header">
			🔋 Features: {features.length + 25}
			{
				offCount === undefined
				? false
				: offCount === features.length
				? '(JS off… are you breaking up with me?)'
				: `(${offCount} off)`
			}
		</strong>
	</summary>
	<p>
		<input
			type="text"
			placeholder="Find features"
			spellcheck="false"
			autocomplete="off"
			autocapitalize="off"
			bind:value={filter}
		>
		<small>Use the "Identify feature" section below if you can't find what
			you're looking for.</small>
	</p>
	<div>
		{#each rows as {feature, issue, hidden} (feature.id)}
			<FeatureItem
				{feature}
				{issue}
				{hidden}
				bind:ref={checkboxes[feature.id]}
				onchange={updateOffCount}
			/>
		{/each}
	</div>
</details>
