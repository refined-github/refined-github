<script lang="ts">
	import {excludeFromDomTextExtraction} from '../github-helpers/parse-rendered-text.js';
	import pluralize from './pluralize.js';
	import getOpenRelatedIssuesCount from './related-issues-count.js';
	import {getFeatureRelatedIssuesUrl} from './rgh-links.js';
	import Tooltipped from './tooltipped.svelte';

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

{#snippet linked(text: string, id: string, labelledBy: string)}
	{#if linkify}
		<a
			id={id}
			aria-labelledby={labelledBy}
			href={relatedIssuesHref}
			data-turbo-frame="repo-content-turbo-frame"
			class={excludeFromDomTextExtraction}
		>{text}</a>
	{:else}
		<span id={id} aria-labelledby={labelledBy}>{text}</span>
	{/if}
{/snippet}

{#snippet linkedWithoutTooltip(text: string)}
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
		{@render linkedWithoutTooltip(labels.loading)}
	{/if}
{:then count}
	{#if count > 0 || labels.zero !== undefined}
		{@const label = pluralize(count, labels.single, labels.plural, labels.zero)}
		<Tooltipped content={pluralize(count, '1 open issue', '$$ open issues', 'No open issues')}>
			{#snippet children(id: string, labelledBy: string)}
				{@render linked(label, id, labelledBy)}
			{/snippet}
		</Tooltipped>
	{/if}
{/await}
