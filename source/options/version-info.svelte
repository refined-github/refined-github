<svelte:options
	customElement={{
		tag: 'rgh-version',
	}}
/>

<!-- prettier-ignore -->
<script lang="ts">
	import getOutdatedVersionAge from '../helpers/outdated-version.js';

	const {version} = chrome.runtime.getManifest();
	const outdatedAge = getOutdatedVersionAge();
</script>

<output>
	{version}{#if outdatedAge}
		— <a href="https://github.com/refined-github/refined-github#install"
			>A newer version may be available</a
		>{/if}
</output>
