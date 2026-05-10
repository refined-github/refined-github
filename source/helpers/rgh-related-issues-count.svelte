<script lang="ts">
	import {excludeFromDomTextExtraction} from '../github-helpers/parse-rendered-text.js';
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

{#snippet linked(text: string)}
	{#if linkify}
		<a
			href={relatedIssuesHref}
			data-turbo-frame="repo-content-turbo-frame"
			class={excludeFromDomTextExtraction}
		>{text}</a>
	{:else}
		{text}
	{/if}
{/snippet}

{#await countPromise}
	{#if labels.loading}
		{@render linked(labels.loading)}
	{/if}
{:then count}
	{#if count > 0 || labels.zero !== undefined}
		{@render linked(pluralize(count, labels.single, labels.plural, labels.zero))}
	{/if}
{/await}
