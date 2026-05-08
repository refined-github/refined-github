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
}: {
featureId: string;
linkify?: boolean;
single: string;
plural?: string;
zero?: string;
} = $props();

let count = $state<number | undefined>(undefined);
const relatedIssuesHref = $derived(getFeatureRelatedIssuesUrl(featureId).href);
const label = $derived(count === undefined ? '' : pluralize(count, single, plural, zero));

$effect(() => {
(async () => {
count = await getOpenRelatedIssuesCount(featureId);
})();
});
</script>

{#if count !== undefined && (count > 0 || zero !== undefined)}
	{#if linkify && count > 0}
		<a
			class="Link--muted"
			href={relatedIssuesHref}
			data-turbo-frame="repo-content-turbo-frame"
		>{label}</a>
	{:else}
		{label}
	{/if}
{/if}
