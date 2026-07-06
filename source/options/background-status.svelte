<svelte:options
	customElement={{
		tag: 'background-status',
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
		<p>
			It seems that the background page failed to load. This breaks some
			features. Please <a
				href="https://github.com/refined-github/refined-github/issues/new?template=1_bug_report.yml"
			>report it</a>.
		</p>
	{/if}
{/await}

<style>
	p {
		padding: 1em;
		border: 1px solid var(--rgh-red);
		background: color-mix(in srgb, var(--rgh-red) 10%, transparent);
	}
</style>
