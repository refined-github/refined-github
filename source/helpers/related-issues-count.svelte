<script lang="ts">
	import {excludeFromDomTextExtraction} from '../github-helpers/parse-rendered-text.js';
	import pluralize from './pluralize.js';
	import getOpenRelatedIssuesCount from './related-issues-count.js';
	import {getFeatureRelatedIssuesUrl} from './rgh-links.js';

	type Props = {
		featureId: string;
		mini?: boolean;
	};

	const {featureId, mini = false}: Props = $props();

	const relatedIssuesHref = $derived.by(() =>
		getFeatureRelatedIssuesUrl(featureId).href
	);
	const countPromise = $derived.by(() => getOpenRelatedIssuesCount(featureId));
</script>

{#snippet linked(text: string, tooltip?: string)}
	{#if tooltip}
		<a
			href={relatedIssuesHref}
			data-turbo-frame="repo-content-turbo-frame"
			class={`${excludeFromDomTextExtraction} tooltipped tooltipped-n`}
			aria-label={tooltip}
		>{text}</a>
	{:else}
		<a
			href={relatedIssuesHref}
			data-turbo-frame="repo-content-turbo-frame"
			class={excludeFromDomTextExtraction}
		>{text}</a>
	{/if}
{/snippet}

{#await countPromise}
	{#if !mini}
		{@render linked('Related issues')}
	{/if}
{:then count}
	{@const openIssuesLabel = pluralize(count, '1 open issue', '$$ open issues', 'No open issues')}
	{#if mini}
		{#if count > 0}
			{@render linked(String(count), openIssuesLabel)}
		{/if}
	{:else}
		{@render linked(openIssuesLabel)}
	{/if}
{/await}
