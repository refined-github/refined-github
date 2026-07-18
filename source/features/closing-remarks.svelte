<script lang="ts">
	import TagIcon from 'octicons-plain-react/Tag';

	import Banner from '../components/banner.svelte';
	import DomChef from '../components/dom-chef.svelte';

	type Props = {
		tagName?: string;
		tagUrl?: string;
		postMerge?: boolean;
		hasPushAccess?: boolean;
		releaseUrl?: string;
	};

	const {tagName, tagUrl, postMerge = false, hasPushAccess, releaseUrl}: Props =
		$props();

	const explanationHref =
		'https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#closing-remarks';
</script>

<!-- Classes copied from #issuecomment-new + mt-3 added (TimelineItem) -->
<div
	class="ml-0 tmp-ml-0 pl-0 tmp-pl-0 ml-md-6 tmp-ml-md-6 pl-md-3 tmp-pl-md-3 mt-3 tmp-mt-3"
>
	{#if tagName && tagUrl}
		<Banner classes={['flash-success', 'rgh-bg-none']}>
			{#snippet icon()}<DomChef as={TagIcon} class="m-0 tmp-m-0" />{/snippet}
			{#snippet text()}
				This pull request first <a href={explanationHref}>appeared</a> in
				<a href={tagUrl} class="Link--primary text-bold">{tagName}</a>
			{/snippet}
		</Banner>
	{:else}
		<Banner
			classes={['rgh-bg-none']}
			action={hasPushAccess ? releaseUrl : undefined}
			buttonLabel={hasPushAccess ? 'Draft a new release' : undefined}
		>
			{#snippet icon()}<DomChef as={TagIcon} class="m-0 tmp-m-0" />{/snippet}
			{#snippet text()}
				{#if postMerge}
					Now you can release this change
				{:else}
					No <a href={explanationHref}>stable version tags</a> for this PR.
				{/if}
			{/snippet}
		</Banner>
	{/if}
</div>
