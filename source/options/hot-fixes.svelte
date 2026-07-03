<svelte:options
	customElement={{
		tag: 'hot-fixes',
		shadow: 'none',
		props: {
			enterprise: {type: 'Boolean', attribute: 'enterprise'},
		},
	}}
/>

<script lang="ts">
	import {brokenFeatures, styleHotfixes} from '../helpers/hotfix.js';
	import isDevelopmentVersion from '../helpers/is-development-version.js';

	const {enterprise = false}: {enterprise?: boolean} = $props();

	const {version} = chrome.runtime.getManifest();

	type HotfixData = {
		hotfixes: string;
		brokenFeatures: string;
	};

	async function loadCached(): Promise<HotfixData> {
		const cachedBrokenFeatures = await brokenFeatures.getCached();
		const cachedStyleHotfixes = await styleHotfixes.getCached(version);
		return {
			hotfixes: cachedStyleHotfixes ?? 'No CSS found in cache.',
			brokenFeatures: cachedBrokenFeatures
				? JSON.stringify(
					cachedBrokenFeatures,
					undefined,
					2,
				)
				: 'No broken features found in cache. This may be indicative of a hotfix loading failure, the list is never empty.',
		};
	}

	// eslint-disable-next-line unicorn/prefer-top-level-await -- https://github.com/sindresorhus/eslint-plugin-unicorn/issues/3488
	let hotfixesPromise = $state(loadCached());

	async function fetchHotfixes(): Promise<HotfixData> {
		return {
			hotfixes: await styleHotfixes.getFresh(version)
				?? 'No hotfixes needed for this version! 🎉',
			brokenFeatures: JSON.stringify(
				await brokenFeatures.getFresh(),
				undefined,
				2,
			),
		};
	}

	function refreshHotfixes(): void {
		hotfixesPromise = fetchHotfixes();
	}
</script>

<div>
	<p>In order to address severe issues as quickly as possible, Refined GitHub
		loads a list of disabled features and temporary CSS fixes.
		<a href="https://github.com/refined-github/yolo">
			More info.
		</a></p>
	{#if isDevelopmentVersion()}
		<p>Hotfixes are not applied in the development version.</p>
	{:else if enterprise}
		<p>Hotfixes are not applied to GitHub Enterprise.</p>
	{:else}
		<p>This is the latest data fetched from the server (or cache):</p>
		{#await hotfixesPromise then data}
			<p>CSS hotfixes:</p>
			<p>
				<textarea rows="2" readonly value={data.hotfixes}></textarea>
			</p>

			<p>Disabled features:</p>
			<p>
				<textarea
					rows="2"
					readonly
					value={data.brokenFeatures}
				></textarea>
			</p>

			<button type="button" onclick={refreshHotfixes}>Fetch hotfixes</button>
		{/await}
	{/if}
</div>
