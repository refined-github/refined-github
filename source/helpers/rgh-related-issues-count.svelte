<script lang="ts">
	/* global FeatureId */
	import getOpenRelatedIssuesCount from './rgh-related-issues-count.js';
	import {getFeatureRelatedIssuesUrl} from './rgh-links.js';

	const {
		featureId,
		linkify = false,
		emptyLabel = '',
	}: {
		featureId: string;
		linkify?: boolean;
		emptyLabel?: string;
	} = $props();

	let count = $state<number | undefined>(undefined);
	const relatedIssuesHref = $derived(getFeatureRelatedIssuesUrl(featureId as FeatureId).href);

	$effect(() => {
		(async () => {
			count = await getOpenRelatedIssuesCount(featureId);
		})();
	});
</script>

{#if count !== undefined && (count > 0 || emptyLabel)}
	<sup data-rgh-feature-related-count="">
		{#if count > 0}
			{#if linkify}
				<a
					class="Link--muted"
					href={relatedIssuesHref}
					data-turbo-frame="repo-content-turbo-frame"
				>{count}</a>
			{:else}
				{count}
			{/if}
		{:else}
			{emptyLabel}
		{/if}
	</sup>
{/if}
