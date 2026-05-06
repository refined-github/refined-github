<script lang="ts">
	import {onMount} from 'svelte';
	import {messageRuntime} from 'webext-msg';

	import {featuresMeta, getNewFeatureName, getOldFeatureNames} from '../feature-data.js';
	import {isFeaturePrivate} from '../helpers/feature-utils.js';
	import {brokenFeatures} from '../helpers/hotfix.js';
	import optionsStorage, {isFeatureDisabled} from '../options-storage.js';

	const {filename}: {filename: string} = $props();

	const isCss = location.pathname.endsWith('.css');
	const currentFeatureName = getNewFeatureName(filename);
	const meta = featuresMeta.find(feature => feature.id === currentFeatureName);
	const id = meta?.id ?? filename;
	const oldNames = getOldFeatureNames(id);

	const description = meta?.description ?? (
		isFeaturePrivate(id)
			? 'This feature applies only to "Refined GitHub" repositories and cannot be disabled.'
			: isCss
				? 'This feature is CSS-only and cannot be disabled.'
				: undefined
	);

	const conversationsUrl = new URL('https://github.com/refined-github/refined-github/issues');
	conversationsUrl.searchParams.set('q', `sort:updated-desc is:open (${[id, ...oldNames].map(name => `"${name}"`).join(' OR ')})`);

	const newIssueUrl = new URL('https://github.com/refined-github/refined-github/issues/new');
	newIssueUrl.searchParams.set('template', '1_bug_report.yml');
	newIssueUrl.searchParams.set('title', `\`${id}\`: `);
	newIssueUrl.searchParams.set('labels', 'bug, help wanted');

	type DisabledBanner =
		| {type: 'hotfixed-old'; issue: string; version: string}
		| {type: 'hotfixed'; issue: string}
		| {type: 'disabled'};

	let disabledBanner = $state<DisabledBanner | undefined>(undefined);

	onMount(async () => {
		// Skip dev check present in `getLocalHotfixes`, we want to see this even when developing
		const hotfixes = await brokenFeatures.get() ?? [];
		const hotfixed = hotfixes.find(([feature]) => feature === id);
		if (hotfixed) {
			const [_name, issue, unaffectedVersion] = hotfixed;
			if (unaffectedVersion) {
				disabledBanner = {type: 'hotfixed-old', issue, version: unaffectedVersion};
			} else {
				disabledBanner = {type: 'hotfixed', issue};
			}

			return;
		}

		if (isFeatureDisabled(await optionsStorage.getAll(), id)) {
			disabledBanner = {type: 'disabled'};
		}
	});

	function openOptions(event: Event): void {
		event.preventDefault();
		void messageRuntime({openOptionsPage: id});
	}
</script>

<!-- Block and width classes required to avoid margin collapse -->
<div class="Box mb-3 d-inline-block width-full">
	<div class="Box-row d-flex gap-3 flex-wrap">
		<div class="rgh-feature-description d-flex flex-column gap-2">
			<h3>
				<code>{id}</code>
				<clipboard-copy
					aria-label="Copy"
					data-copy-feedback="Copied!"
					value={id}
					class="Link--onHover color-fg-muted d-inline-block ml-2"
					tabindex="0"
					role="button"
				>
					<svg class="octicon octicon-copy v-align-baseline" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" role="img" aria-hidden="true">
						<path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
						<path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
					</svg>
				</clipboard-copy>
			</h3>
			{#if oldNames.length > 0}
				<div class="color-fg-muted mt-n3">
					<span class="text-small">previously named </span>
					{#each oldNames as name, index}
						{#if index > 0}, {/if}<code>{name}</code>
					{/each}
				</div>
			{/if}
			{#if description}
				<div class="h3">{@html description}</div>
			{/if}
			<div class="no-wrap">
				<a href={conversationsUrl.href} data-turbo-frame="repo-content-turbo-frame">Related issues</a>
				 • 
				<a href={newIssueUrl.href} data-turbo-frame="repo-content-turbo-frame">Report bug</a>
				{#if meta && isCss && !meta.cssOnly}
					 • <a data-turbo-frame="repo-content-turbo-frame" href={location.pathname.replace('.css', '.tsx')}>See .tsx file</a>
				{:else if meta?.css && !isCss}
					 • <a data-turbo-frame="repo-content-turbo-frame" href={location.pathname.replace('.tsx', '.css')}>See .css file</a>
				{/if}
			</div>
		</div>
		{#if meta?.screenshot}
			<a href={meta.screenshot} class="flex-self-center">
				<img
					src={meta.screenshot}
					alt="Screenshot of {id} feature"
					class="d-block border"
					style="max-height: 100px; max-width: 150px;"
				/>
			</a>
		{/if}
	</div>
</div>

{#if disabledBanner}
	<!-- Block and width classes required to avoid margin collapse -->
	<div class={['flash', 'mb-3', 'd-inline-block', 'width-full', ...(disabledBanner.type !== 'hotfixed-old' ? ['flash-warn'] : [])].join(' ')}>
		<div class="d-sm-flex flex-items-center gap-2">
			<div class="d-flex flex-auto flex-self-center flex-items-center gap-2">
				{#if disabledBanner.type === 'hotfixed-old'}
					<svg class="octicon octicon-info mr-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" role="img" aria-hidden="true">
						<path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
					</svg>
					<span>This feature was disabled until version {disabledBanner.version} due to <a target="_blank" rel="noopener noreferrer" data-hovercard-type="issue" data-hovercard-url="https://github.com/refined-github/refined-github/issues/{disabledBanner.issue}/hovercard" href="https://github.com/refined-github/refined-github/issues/{disabledBanner.issue}">#{disabledBanner.issue}</a>.</span>
				{:else if disabledBanner.type === 'hotfixed'}
					<svg class="octicon octicon-alert mr-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" role="img" aria-hidden="true">
						<path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
					</svg>
					<span>This feature is disabled due to <a target="_blank" rel="noopener noreferrer" data-hovercard-type="issue" data-hovercard-url="https://github.com/refined-github/refined-github/issues/{disabledBanner.issue}/hovercard" href="https://github.com/refined-github/refined-github/issues/{disabledBanner.issue}">#{disabledBanner.issue}</a>.</span>
				{:else}
					<svg class="octicon octicon-alert mr-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" role="img" aria-hidden="true">
						<path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
					</svg>
					<span>You disabled this feature on GitHub.com.</span>
				{/if}
			</div>
			{#if disabledBanner.type === 'disabled'}
				<button
					type="button"
					class="flex-shrink-0 btn btn-sm ml-sm-3 mt-2 mt-sm-n2 mb-sm-n2 mr-sm-n1 flex-self-center"
					onclick={openOptions}
				>Refined GitHub Options</button>
			{/if}
		</div>
	</div>
{/if}
