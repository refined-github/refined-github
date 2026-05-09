<script lang="ts">
	import pluralize from './pluralize.js';
	import {getFeatureRelatedIssuesUrl} from './rgh-links.js';
	import getOpenRelatedIssuesCount from './rgh-related-issues-count.js';

	const {
		featureId,
		linkify = false,
		single,
		plural,
		zero,
		loading,
	}: {
		featureId: string;
		linkify?: boolean;
		single: string;
		plural?: string;
		zero?: string;
		loading?: string;
	} = $props();

	const relatedIssuesHref = $derived(getFeatureRelatedIssuesUrl(featureId).href);
	const countPromise = $derived(getOpenRelatedIssuesCount(featureId));
</script>

{#await countPromise}
	{#if loading !== undefined}{loading}{/if}
{:then count}
	{#if count > 0 || zero !== undefined}
		{#if linkify}
			<a
				href={relatedIssuesHref}
				data-turbo-frame="repo-content-turbo-frame"
			>{pluralize(count, single, plural, zero)}</a>
		{:else}
			{pluralize(count, single, plural, zero)}
		{/if}
	{/if}
{/await}
