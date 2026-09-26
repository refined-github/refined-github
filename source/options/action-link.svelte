<script lang="ts">
	import LinkIcon from 'octicons-plain-react/Link';

	import DomChef from '../components/dom-chef.svelte';
	import {doesBrowserActionOpenOptions} from '../helpers/feature-utils.js';

	const {enterprise = false}: {enterprise: boolean} = $props();
	const hidden = $derived(enterprise || doesBrowserActionOpenOptions);
</script>
{#if !hidden}
	<details id="action">
		<summary><DomChef as={LinkIcon} /> Button link</summary>
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
