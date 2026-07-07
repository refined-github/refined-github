<script lang="ts">
	import * as pageDetect from 'github-url-detection';
	import CopyIcon from 'octicons-plain-react/Copy';

	import {getOldFeatureNames} from '../feature-data.js';
	import {buildRepoUrl} from '../github-helpers/index.js';
	import DomChef from '../helpers/dom-chef.svelte';
	import {isFeaturePrivate} from '../helpers/feature-utils.js';
	import RelatedIssuesCount from '../helpers/related-issues-count.svelte';

	// eslint-disable-next-line no-undef -- Global
	const {id, meta}: {id: string; meta: FeatureMeta | undefined} = $props();

	const wasFeatureRemoved = $derived(!meta && !isFeaturePrivate(id));
	const isReportingBug = pageDetect.isNewIssue();
	const pathname = $derived(
		isReportingBug
			// Use .css so that it links to the .tsx file
			? buildRepoUrl('blob', 'main', 'source', 'features', `${id}.css`)
			: location.pathname,
	);
	const isCss = $derived(pathname.endsWith('.css'));

	const description = $derived(
		meta
			? meta.description
				+ (meta.cssOnly ? ' This feature is CSS-only and cannot be disabled.' : '')
			: isFeaturePrivate(id)
			? 'This feature applies only to "Refined GitHub" repositories and cannot be disabled.'
			: undefined,
	);

	const oldNames = $derived(getOldFeatureNames(id));

	const newIssueUrl = $derived.by(() => {
		const url = new URL(
			'https://github.com/refined-github/refined-github/issues/new',
		);
		url.searchParams.set('template', '1_bug_report.yml');
		url.searchParams.set('title', `\`${id}\`  `); // Trailing double-space to avoid triggering datalist autocomplete
		url.searchParams.set('labels', 'bug, help wanted');
		return url;
	});
</script>

{#snippet featureLink(href: string, label: string)}
	<a data-turbo-frame="repo-content-turbo-frame" {href}>{label}</a>
{/snippet}

<!-- Block and width classes required to avoid margin collapse -->
<div
	class="Box mb-3 tmp-mb-3 d-inline-block width-full rgh-feature-description"
>
	<div class="Box-row d-flex gap-3 flex-wrap">
		<div class="rgh-feature-description d-flex flex-column gap-2">
			<h3>
				{#if description}
					<code>{id}</code>
					<clipboard-copy
						aria-label="Copy"
						data-copy-feedback="Copied!"
						value={id}
						class="Link--onHover color-fg-muted d-inline-block ml-2"
						tabindex="0"
						role="button"
					>
						<DomChef as={CopyIcon} class="v-align-baseline" />
					</clipboard-copy>
				{:else}
					<span class="color-fg-muted">
						This feature is no longer part of Refined GitHub.
					</span>
				{/if}
			</h3>

			{#if oldNames.length > 0}
				<div class="color-fg-muted mt-n3 tmp-mt-n3">
					<span class="text-small">previously named </span>
					{#each oldNames as name, index (name)}
						{#if index > 0}, {/if}<code>{name}</code>
					{/each}
				</div>
			{/if}

			{#if description}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<div class="h3">{@html description}</div>
			{/if}

			<div class="no-wrap">
				<RelatedIssuesCount featureId={id} />
				{#if !wasFeatureRemoved && !isReportingBug}
					•
					{@render featureLink(newIssueUrl.href, 'Report bug')}
				{/if}
				{#if meta}
					{#if isCss && !meta.cssOnly}
						•
						{@render featureLink(pathname.replace('.css', '.tsx'), 'See .tsx file')}
					{:else if meta.css && !isCss}
						•
						{@render featureLink(pathname.replace('.tsx', '.css'), 'See .css file')}
					{/if}
				{/if}
				{#if wasFeatureRemoved}
					•
					{@render featureLink(
						// This links to the full commit history, which will start with the commit that removed the file
						`https://github.com/refined-github/refined-github/commits/main/source/features/${id}.tsx`,
						'Commit history',
					)}
				{/if}
			</div>
		</div>

		<!-- eslint-disable-next-line refined-github/no-optional-chaining -- Undocumented feature, no meta  -->
		{#if meta?.screenshot}
			<a href={meta.screenshot} class="flex-self-center">
				<img
					src={meta.screenshot}
					class="d-block border"
					style:max-height="100px"
					style:max-width="150px"
					alt=""
				/>
			</a>
		{/if}
	</div>
</div>
