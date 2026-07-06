<svelte:options
	customElement={{
		tag: 'action-link',
		shadow: 'none',
		props: {
			domain: {type: 'String', attribute: 'domain'},
		},
	}}
/>

<script lang="ts">
	import {doesBrowserActionOpenOptions} from '../helpers/feature-utils.js';

	const {domain = 'default'}: {domain?: string} = $props();
	const hidden = $derived(domain !== 'default' || !doesBrowserActionOpenOptions);
</script>

<details id="action" {hidden}>
	<summary><strong>🔗 Button link</strong></summary>
	<div>
		<p>You can pick what page opens when you click the Refined GitHub icon in
			the browser toolbar</p>
		<p><input
				type="url"
				name="actionUrl"
				placeholder="https://example.com"
				spellcheck="false"
				autocomplete="off"
				autocapitalize="off"
			></p>
		<p>If left empty, clicking it will open this options page.</p>
	</div>
</details>
