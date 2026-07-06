<svelte:options
	customElement={{
		tag: 'rgh-version',
	}}
/>

<script lang="ts">
	import {
		getExtensionReleaseDate,
		toDaysAgo,
		wasReleasedLongAgo,
	} from '../helpers/extension-release-age.js';

	const {version} = chrome.runtime.getManifest();

	const releaseDate = getExtensionReleaseDate();
	const releaseAgeInDays = toDaysAgo(releaseDate);
</script>

<output>
	{version}
	{#if wasReleasedLongAgo(releaseAgeInDays)}
		— Released {releaseAgeInDays} days ago.
		<a href="https://github.com/refined-github/refined-github#install">
			A newer version may be available
		</a>
	{/if}
</output>
