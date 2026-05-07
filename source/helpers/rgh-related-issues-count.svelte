<svelte:options
	customElement={{
		tag: 'rgh-related-issues-count',
		shadow: 'none',
		props: {
			featureId: {attribute: 'feature-id', type: 'String'},
			includeLink: {attribute: 'include-link', type: 'Boolean'},
			emptyLabel: {attribute: 'empty-label', type: 'String'},
		},
	}}
/>

<script lang="ts">
	import {logError} from './errors.js';
	import getOpenRelatedIssuesCount, {getFeatureRelatedIssuesUrlForAnyName} from './rgh-related-issues-count.js';

	let count = $state(0);
	let loaded = $state(false);
	const {
		featureId,
		includeLink = false,
		emptyLabel = '',
	}: {
		featureId?: string;
		includeLink?: boolean;
		emptyLabel?: string;
	} = $props();

	async function loadCount(feature: string): Promise<void> {
		count = await getOpenRelatedIssuesCount(feature);
		loaded = true;
	}

	$effect(() => {
		if (!featureId) {
			return;
		}

		(async () => {
			try {
				await loadCount(featureId);
			} catch (error) {
				logError(error instanceof Error ? error : new Error(String(error)));
			}
		})();
	});
</script>

{#if loaded && (count > 0 || emptyLabel)}
	<sup data-rgh-feature-related-count="">
		{#if count > 0}
			{#if includeLink}
				<a
					class="Link--muted"
					href={getFeatureRelatedIssuesUrlForAnyName(featureId).href}
					data-turbo-frame="repo-content-turbo-frame"
				>{count}</a>
			{:else}
				{count}
			{/if}
		{:else}
			{emptyLabel}
		{/if}
	</sup>
{/if}
