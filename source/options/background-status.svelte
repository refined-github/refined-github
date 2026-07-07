<svelte:options
	customElement={{
		tag: 'background-status',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import {messageRuntime} from 'webext-msg';

	import delay from '../helpers/delay';

	const ping = Promise.race([
		messageRuntime({ping: true}).catch(() => undefined),
		delay(500),
	]);
</script>

{#await ping then response}
	{#if response !== 'pong'}
		<p class="error-banner">
			It seems that the background page failed to load. This breaks some
			features. Please <a
				href="https://github.com/refined-github/refined-github/issues/new?template=1_bug_report.yml"
			>report it</a>.
		</p>
	{/if}
{/await}
