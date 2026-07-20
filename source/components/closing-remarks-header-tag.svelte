<script lang="ts">
	import TagIcon from 'octicons-plain-react/Tag';

	import {buildRepoUrl} from '../github-helpers/index.js';
	import DomChef from './dom-chef.svelte';

	const {tagName}: {tagName: string} = $props();

	const tagUrl = $derived(buildRepoUrl('releases/tag', tagName));
</script>

<a
	href={tagUrl}
	class="text-bold Link--primary no-underline"
	title="{tagName} was the first Git tag to include this pull request"
>
	<DomChef as={TagIcon} class="mr-1 tmp-mr-1 color-fg-muted" />
	{tagName}
</a>
