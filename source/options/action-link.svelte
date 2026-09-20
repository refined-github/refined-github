<script lang="ts">
	import LinkIcon from 'octicons-plain-react/Link';

	import {doesBrowserActionOpenOptions} from '../helpers/feature-utils.js';
	import DomChef from '../components/dom-chef.svelte';

	const {enterprise = false}: {enterprise: boolean} = $props();
	const hidden = $derived(enterprise || doesBrowserActionOpenOptions);
</script>
{#if !hidden}
	<details id="action">
		<summary><strong><DomChef as={LinkIcon} class="mr-1 tmp-mr-1 color-fg-muted" /> Button link</strong></summary>
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
