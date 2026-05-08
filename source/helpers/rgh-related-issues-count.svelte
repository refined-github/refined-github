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

	let count = $state<number | undefined>(undefined);
	const relatedIssuesHref = $derived(getFeatureRelatedIssuesUrl(featureId).href);
	const label = $derived(
		count === undefined ? loading : count === 0 ? zero : pluralize(count, single, plural),
	);

	$effect(() => {
		(async () => {
			count = await getOpenRelatedIssuesCount(featureId);
		})();
	});
</script>

{#if label !== undefined}
	{#if linkify}
		<a
			class="Link--muted"
			href={relatedIssuesHref}
			data-turbo-frame="repo-content-turbo-frame"
		>{label}</a>
	{:else}
		{label}
	{/if}
{/if}
