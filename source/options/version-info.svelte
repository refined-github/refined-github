<svelte:options
	customElement={{
		tag: 'rgh-version',
	}}
/>

<!-- prettier-ignore -->
<script lang="ts">
	import {getExtensionReleaseDate, toDaysAgo, wasReleasedLongAgo} from '../helpers/extension-version.js';

	const {version} = chrome.runtime.getManifest();

	const releaseDate = getExtensionReleaseDate();
	const releaseAgeInDays = toDaysAgo(releaseDate);
</script>

<output>
	{version}{#if wasReleasedLongAgo(releaseAgeInDays)}
		— <a href="https://github.com/refined-github/refined-github#install"
			>Released {releaseAgeInDays} days ago. A newer version may be available</a
		>{/if}
</output>
