<svelte:options
	customElement={{
		tag: 'background-status',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import {messageRuntime} from 'webext-msg';

	let failed = $state(false);

	messageRuntime({ping: true}).then(response => {
		failed = response !== 'pong';
	});
</script>

{#if failed}
	<p class="js-background-fail-banner">
		It seems that the background page failed to load. This breaks some features. Please <a href="https://github.com/refined-github/refined-github/issues/new?template=1_bug_report.yml">report it</a>.
	</p>
{/if}
