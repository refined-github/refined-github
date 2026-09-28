<script lang="ts">
	import api from '../github-helpers/api.js';
	import {excludeFromDomTextExtraction} from '../github-helpers/parse-rendered-text.js';
	import pluralize from '../helpers/pluralize.js';
	import {
		getFeatureRelatedIssuesQuery,
		getFeatureRelatedIssuesUrl,
	} from '../helpers/rgh-links.js';
	import CountIssues from './related-issues-count.gql';

	type Props = {
		featureId: string;
		mini?: boolean;
	};

	const {featureId, mini = false}: Props = $props();

	const relatedIssuesHref = $derived.by(() =>
		getFeatureRelatedIssuesUrl(featureId).href
	);

	const countPromise = $derived.by(async (): Promise<number> => {
		const query = 'repo:refined-github/refined-github '
			+ getFeatureRelatedIssuesQuery(featureId);

		const {search} = await api.v4(CountIssues, {variables: {query}});
		return search.issueCount;
	});
</script>

{#snippet linked(text: string, tooltip?: string)}
	<a
		href={relatedIssuesHref}
		data-turbo-frame="repo-content-turbo-frame"
		class={excludeFromDomTextExtraction}
		class:tooltipped={tooltip}
		class:tooltipped-n={tooltip}
		aria-label={tooltip || undefined}
	>
		{text}
	</a>
{/snippet}

{#await countPromise}
	{#if !mini}
		{@render linked('Related issues')}
	{/if}
{:then count}
	{@const openIssuesLabel = pluralize(
		count,
		'1 mention',
		'$$ mentions',
		'Related issues',
	)}
	{#if mini}
		{#if count > 0}
			{@render linked(String(count), openIssuesLabel)}
		{/if}
	{:else}
		{@render linked(openIssuesLabel)}
	{/if}
{/await}
