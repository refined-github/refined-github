<script lang="ts">
	import {onMount} from 'svelte';
	import AlertIcon from 'octicons-plain-react/Alert';
	import CopyIcon from 'octicons-plain-react/Copy';
	import InfoIcon from 'octicons-plain-react/Info';
	import {createElement} from 'dom-chef';
	import {messageRuntime} from 'webext-msg';

	import createBanner from './github-helpers/banner.js';
	import {featuresMeta, getNewFeatureName, getOldFeatureNames} from './feature-data.js';
	import {isFeaturePrivate} from './helpers/feature-utils.js';
	import {brokenFeatures} from './helpers/hotfix.js';
	import Dom from './helpers/dom.svelte';
	import React from './helpers/react.svelte';
	import {createRghIssueLink} from './helpers/rgh-links.js';
	import optionsStorage, {isFeatureDisabled} from './options-storage.js';

	const [, filename] = /source\/features\/([^.]+)/.exec(location.pathname) ?? [];

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

	async function openOptions(event: Event): Promise<void> {
		event.preventDefault();
		await messageRuntime({openOptionsPage: id});
	}

	const bannerClasses = ['mb-3', 'd-inline-block', 'width-full'];

	function getBannerElement(banner: DisabledBanner) {
		if (banner.type === 'hotfixed-old') {
			return createBanner({
				icon: createElement(InfoIcon, {className: 'mr-0'}),
				classes: bannerClasses,
				text: ['This feature was disabled until version ', banner.version, ' due to ', createRghIssueLink(banner.issue), '.'],
			});
		}

		if (banner.type === 'hotfixed') {
			return createBanner({
				icon: createElement(AlertIcon, {className: 'mr-0'}),
				classes: [...bannerClasses, 'flash-warn'],
				text: ['This feature is disabled due to ', createRghIssueLink(banner.issue), '.'],
			});
		}

		// User disabled this feature
		return createBanner({
			icon: createElement(AlertIcon, {className: 'mr-0'}),
			classes: [...bannerClasses, 'flash-warn'],
			text: 'You disabled this feature on GitHub.com.',
			action: openOptions,
			buttonLabel: 'Refined GitHub Options',
		});
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
					<React use={CopyIcon} props={{className: 'v-align-baseline'}} />
				</clipboard-copy>
			</h3>
			{#if oldNames.length > 0}
				<div class="color-fg-muted mt-n3">
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
	<Dom element={getBannerElement(disabledBanner)} />
{/if}
