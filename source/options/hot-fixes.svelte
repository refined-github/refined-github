<svelte:options
	customElement={{
		tag: 'hot-fixes',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import {onMount} from 'svelte';

	import isDevelopmentVersion from '../helpers/is-development-version.js';
	import {brokenFeatures, styleHotfixes} from '../helpers/hotfix.js';

	const {domain = 'default'}: {domain?: string} = $props();

	const {version} = chrome.runtime.getManifest();

	let hotfixesText = $state('');
	let brokenFeaturesText = $state('');
	let showBrokenFeatures = $state(false);
	let pending = $state(false);

	function getExclusions(): string | void {
		if (domain !== 'default') {
			return 'Hotfixes are not applied on GitHub Enterprise.';
		}

		if (isDevelopmentVersion()) {
			return 'Hotfixes are not applied in the development version';
		}
	}

	async function fetchHotfixes(): Promise<void> {
		pending = true;
		try {
			hotfixesText = getExclusions()
				?? await styleHotfixes.getFresh(version)
				?? 'No hotfixes needed for this version! 🎉';

			const storage = await brokenFeatures.getFresh();
			brokenFeaturesText = JSON.stringify(storage, undefined, 2);
			showBrokenFeatures = true;
		} finally {
			pending = false;
		}
	}

	onMount(async () => {
		hotfixesText = getExclusions()
			?? await styleHotfixes.getCached(version)
			?? 'No CSS found in cache.';
	});
</script>

<div>
	<p>In order to address severe issues as quickly as possible, Refined GitHub loads a list of disabled features and temporary CSS fixes. <a href="https://github.com/refined-github/yolo">More info.</a></p>
	<p>This is the latest CSS fetched from the server (if any):</p>
	<p><textarea rows="2" disabled value={hotfixesText}></textarea></p>
	{#if showBrokenFeatures}
		<p><textarea rows="2" disabled value={brokenFeaturesText}></textarea></p>
	{/if}
	<button type="button" disabled={pending} onclick={fetchHotfixes}>Fetch hotfixes</button>
</div>
