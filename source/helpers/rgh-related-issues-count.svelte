<script lang="ts">
	import pluralize from './pluralize.js';
	import {getFeatureRelatedIssuesUrl} from './rgh-links.js';
	import getOpenRelatedIssuesCount from './rgh-related-issues-count.js';

	type Labels = {
		single: string;
		plural?: string;
		zero?: string;
		loading?: string;
	};

	type Props = {
		featureId: string;
		linkify?: boolean;
		labels: Labels;
	};

	const {featureId, linkify = true, labels}: Props = $props();

	const relatedIssuesHref = $derived.by(() =>
		getFeatureRelatedIssuesUrl(featureId).href
	);
	const countPromise = $derived.by(() => getOpenRelatedIssuesCount(featureId));
</script>

{#await countPromise}
	{#if labels.loading !== undefined}{labels.loading}{/if}
{:then count}
	{#if count > 0 || labels.zero !== undefined}
		{#if linkify}
			<a
				href={relatedIssuesHref}
				data-turbo-frame="repo-content-turbo-frame"
			>{pluralize(count, labels.single, labels.plural, labels.zero)}</a>
		{:else}
			{pluralize(count, labels.single, labels.plural, labels.zero)}
		{/if}
	{/if}
{/await}
