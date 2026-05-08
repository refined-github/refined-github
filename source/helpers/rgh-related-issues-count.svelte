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

{#snippet renderLabel(label: string)}
	{#if linkify}
		<a
			class="Link--muted"
			href={relatedIssuesHref}
			data-turbo-frame="repo-content-turbo-frame"
		>{label}</a>
	{:else}
		{label}
	{/if}
{/snippet}

{#await countPromise}
	{#if loading !== undefined}{loading}{/if}
{:then count}
	{#if count > 0 || zero !== undefined}
		{@render renderLabel(pluralize(count, single, plural, zero))}
	{/if}
{:catch}
	{#if zero !== undefined}
		{@render renderLabel(pluralize(0, single, plural, zero))}
	{/if}
{/await}
