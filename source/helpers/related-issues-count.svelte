<script lang="ts">
	import {excludeFromDomTextExtraction} from '../github-helpers/parse-rendered-text.js';
	import pluralize from './pluralize.js';
	import getOpenRelatedIssuesCount from './related-issues-count.js';
	import {getFeatureRelatedIssuesUrl} from './rgh-links.js';

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

{#snippet linked(text: string, openIssuesTooltip?: string)}
	{#if linkify}
		{@const linkAttributes = openIssuesTooltip
			? {
				class: `${excludeFromDomTextExtraction} tooltipped tooltipped-s`,
				'aria-label': openIssuesTooltip,
			}
			: {class: excludeFromDomTextExtraction}}
		<a
			href={relatedIssuesHref}
			data-turbo-frame="repo-content-turbo-frame"
			{...linkAttributes}
		>{text}</a>
	{:else}
		{@const spanAttributes = openIssuesTooltip
			? {
				class: 'tooltipped tooltipped-s',
				'aria-label': openIssuesTooltip,
			}
			: {}}
		<span {...spanAttributes}>{text}</span>
	{/if}
{/snippet}

{#await countPromise}
	{#if labels.loading}
		{@render linked(labels.loading)}
	{/if}
{:then count}
	{#if count > 0 || labels.zero !== undefined}
		{@const label = pluralize(count, labels.single, labels.plural, labels.zero)}
		{@const openIssuesTooltip = pluralize(count, '1 open issue', '$$ open issues', 'No open issues')}
		{@render linked(label, openIssuesTooltip)}
	{/if}
{/await}
