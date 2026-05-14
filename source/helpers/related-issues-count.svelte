<script lang="ts">
	import {excludeFromDomTextExtraction} from '../github-helpers/parse-rendered-text.js';
	import pluralize from './pluralize.js';
	import getOpenRelatedIssuesCount from './related-issues-count.js';
	import {getFeatureRelatedIssuesUrl} from './rgh-links.js';
	import addToolTip from './tooltip.js';

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

	function tooltipAction(node: globalThis.HTMLElement, content?: string) {
		let tooltip: globalThis.HTMLElement | undefined;

		const apply = (value?: string): void => {
			tooltip?.remove();
			tooltip = undefined;
			if (!value) {
				return;
			}

			addToolTip(value, node);
			const tooltipId = node.getAttribute('aria-labelledby');
			const potentialTooltip = tooltipId && globalThis.document.querySelector<globalThis.HTMLElement>(`#${tooltipId}`);
			if (potentialTooltip?.matches('tool-tip')) {
				tooltip = potentialTooltip;
			}
		};

		apply(content);

		return {
			update: apply,
			destroy() {
				tooltip?.remove();
			},
		};
	}
</script>

{#snippet linked(text: string, openIssuesTooltip?: string)}
	{#if linkify}
		<a
			href={relatedIssuesHref}
			data-turbo-frame="repo-content-turbo-frame"
			class={excludeFromDomTextExtraction}
			use:tooltipAction={openIssuesTooltip}
		>{text}</a>
	{:else}
		<span use:tooltipAction={openIssuesTooltip}>{text}</span>
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
