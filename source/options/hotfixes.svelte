<script lang="ts">
	import {brokenFeatures, styleHotfixes} from '../helpers/hotfix.js';
	import isDevelopmentVersion from '../helpers/is-development-version.js';

	const {enterprise = false}: {enterprise: boolean} = $props();
	const {version} = chrome.runtime.getManifest();
	let emptied = $state(false);

	let hotfixesPromise = $state(styleHotfixes.get(version));

	let brokenFeaturesPromise = $state(brokenFeatures.get());
	function refreshHotfixes(): void {
		emptied = false;
		hotfixesPromise = styleHotfixes.getFresh(version);
		brokenFeaturesPromise = brokenFeatures.getFresh();
	}

	function emptyHotfixes(): void {
		hotfixesPromise = styleHotfixes.setCached('', version);
		brokenFeaturesPromise = brokenFeatures.setCached([]);
		emptied = true;
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
		<button type="button" onclick={emptyHotfixes}>
			Empty hotfixes
		</button>
	</p>
	<p hidden={!emptied}>
		Hotfixes have been emptied and will stay empty until the next auto-update in a few hours.
	</p>
	<h3>CSS hotfixes</h3>
	<p>
		{#await hotfixesPromise then hotfixes}
			{#if hotfixes}
				<textarea readonly class="text-monospace text-code"
				>{hotfixes}</textarea>
			{:else}
				<textarea readonly class="text-italics"
				>No hotfixes needed for this version! 🎉</textarea>
			{/if}
		{/await}
	</p>
	<h3>Disabled features</h3>
	<p>
		{#await brokenFeaturesPromise then features}
			{#if features.length}
				<textarea readonly class="text-monospace"
				>{
						features.map(line => line.join(' ')).join('\n')
					}</textarea>
			{:else}
				<textarea readonly class="text-italics"
				>No broken features found in cache. This may be indicative of a hotfix loading failure, the list is never empty if you've ever opened github.com</textarea>
			{/if}
		{/await}
	</p>
{/if}
