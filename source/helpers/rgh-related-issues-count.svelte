<script lang="ts">
	import pluralize from './pluralize.js';
  import { getFeatureRelatedIssuesUrl } from "./rgh-links.js";
  import getOpenRelatedIssuesCount from "./rgh-related-issues-count.js";

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

  $effect(() => {
    (async () => {
      count = await getOpenRelatedIssuesCount(featureId);
    })();
  });
</script>

{#if count === undefined}
	{#if loading !== undefined}{loading}{/if}
{:else if count === 0}
	{#if zero !== undefined}{zero}{/if}
{:else if linkify}
	<a
		class="Link--muted"
		href={relatedIssuesHref}
		data-turbo-frame="repo-content-turbo-frame"
	>{pluralize(count, single, plural)}</a>
{:else}
	{pluralize(count, single, plural)}
{/if}
