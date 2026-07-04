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

	const {enterprise = false}: {enterprise: boolean} = $props();
	const {version} = chrome.runtime.getManifest();

	let hotfixesPromise = $state(styleHotfixes.getCached(version));

	let brokenFeaturesPromise = $state(brokenFeatures.getCached());
	function refreshHotfixes(): void {
		hotfixesPromise = styleHotfixes.getFresh(version);
		brokenFeaturesPromise = brokenFeatures.getFresh();
	}
</script>
<p>In order to address severe issues as quickly as possible, Refined GitHub
	loads a list of disabled features and temporary CSS fixes.
	<a href="https://github.com/refined-github/yolo">
		More info.
	</a>
</p>
{#if isDevelopmentVersion()}
	<p>Hotfixes are not applied in the development version.</p>
{:else if enterprise}
	<p>Hotfixes are not applied to GitHub Enterprise.</p>
{:else}
	<p>
		<button type="button" onclick={refreshHotfixes}>
			Update hotfixes
		</button>
	</p>
	{#await hotfixesPromise then hotfixes}
		<h3>CSS hotfixes</h3>
		<p>
			{#if hotfixes}
				<textarea rows="2" readonly>{hotfixes}</textarea>
			{:else}
				No hotfixes needed for this version! 🎉
			{/if}
		</p>
	{/await}
	{#await brokenFeaturesPromise then features}
		<h3>Disabled features</h3>
		<p>
			{#if features}
				<textarea
					rows="2"
					readonly
				>{
						features.map(line => line.join(' ')).join('\n')
					}</textarea>
			{:else}
				No broken features found in cache. This may be indicative of a hotfix
				loading failure, the list is never empty if you've ever opened
				github.com
			{/if}
		</p>
	{/await}
{/if}
