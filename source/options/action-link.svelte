<svelte:options
	customElement={{
		tag: 'action-link',
		shadow: 'none',
		props: {
			enterprise: {type: 'Boolean', attribute: 'enterprise'},
		},
	}}
/>

<script lang="ts">
	import {doesBrowserActionOpenOptions} from '../helpers/feature-utils.js';

	const {enterprise = false}: {enterprise: boolean} = $props();
	const hidden = $derived(enterprise || doesBrowserActionOpenOptions);
</script>
{#if !hidden}
	<details id="action">
		<summary><strong>🔗 Button link</strong></summary>
		<div>
			<p>You can pick what page opens when you click the Refined GitHub icon in
				the browser toolbar</p>
			<p>
				<input
					type="url"
					name="actionUrl"
					placeholder="https://example.com"
					autocomplete="off"
				>
			</p>
			<p>If left empty, clicking it will open this options page.</p>
		</div>
	</details>
{/if}
