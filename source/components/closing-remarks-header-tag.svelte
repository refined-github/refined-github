<script lang="ts">
	import TagIcon from 'octicons-plain-react/Tag';

	import DomChef from './dom-chef.svelte';

	const {tagName, tagUrl}: {tagName: string; tagUrl: string} = $props();
</script>

<a
	href={tagUrl}
	class="text-bold Link--primary no-underline"
	title="{tagName} was the first Git tag to include this pull request"
>
	<DomChef as={TagIcon} class="ml-2 tmp-ml-2 mr-1 tmp-mr-1 color-fg-muted" />
	{tagName}
</a>
