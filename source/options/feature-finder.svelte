<svelte:options
	customElement={{
		tag: 'feature-finder',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import {startFeatureIdentification} from '../helpers/bisect.js';

	let disabled = $state(false);
	let showMessage = $state(false);

	async function findFeature(): Promise<void> {
		await startFeatureIdentification();

		disabled = true;
		setTimeout(() => {
			disabled = false;
		}, 10_000);

		showMessage = true;
	}
</script>

<p>
	This process will help you identify what Refined GitHub feature is making
	changes or causing issues on GitHub.
</p>
<p>
	<button {disabled} onclick={findFeature}
	>Start process to identify feature…</button>
</p>
{#if showMessage}
	<p>
		Visit the GitHub page where you want to find the feature and refresh it to
		see the instructions. You can navigate to any page, but don’t use multiple
		tabs.
	</p>
{/if}
