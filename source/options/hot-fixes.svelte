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


	async function loadCached(): Promise<string> {
		return await styleHotfixes.getCached(version)
			?? 'No CSS found in cache.';
	}

	let brokenFeaturesText = $state<string | undefined>();
	// eslint-disable-next-line unicorn/prefer-top-level-await -- https://github.com/sindresorhus/eslint-plugin-unicorn/issues/3488
	let hotfixesPromise = $state(loadCached());

	async function fetchHotfixes(): Promise<string> {
		const hotfixes = await styleHotfixes.getFresh(version)
			?? 'No hotfixes needed for this version! 🎉';
		const storage = await brokenFeatures.getFresh();
		brokenFeaturesText = JSON.stringify(storage, undefined, 2);
		return hotfixes;
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
		<p>This is the latest CSS fetched from the server (if any):</p>
		{#await hotfixesPromise then hotfixes}
			<p><textarea rows="2" readonly value={hotfixes}></textarea></p>
			{#if brokenFeaturesText}
				<p>
					<textarea
						rows="2"
						readonly
						value={brokenFeaturesText}
					></textarea>
				</p>
			{/if}
			<button type="button" onclick={refreshHotfixes}>Fetch hotfixes</button>
		{/await}
	{/if}
</div>
