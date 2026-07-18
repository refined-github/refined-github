import './rgh-feature-descriptions.css';

import delegate from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {mount} from 'svelte';

import {featuresMeta, getNewFeatureName} from '../feature-data.js';
import features from '../feature-manager.js';
import {isRefinedGitHubRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {openInNewTab} from './prevent-comment-loss.js';
import Description from './rgh-feature-descriptions.svelte';

function addDescription(anchor: HTMLElement, id: string, meta: FeatureMeta | undefined): void {
	const container = <div />;
	mount(Description, {target: container, props: {id, meta}});
	anchor.before(container);
}

async function addFeatureInformationWidget(
	infoBanner: HTMLElement,
	idFromUrl: string,
): Promise<void> {
	// Enable link even on past commits
	const latestId = getNewFeatureName(idFromUrl) ?? idFromUrl;
	const meta = featuresMeta.find(feature => feature.id === latestId);

	// This ID exists whether the feature is documented or not
	const id = meta?.id ?? latestId;

	addDescription(infoBanner, id, meta);
}

function getFeatureNameFromIssueTitle(): string | undefined {
	const title = new URLSearchParams(location.search).get('title') ?? '';
	// The title might be missing altogether
	return /^`(?<id>[^`]+)`/.exec(title)?.groups?.id;
}

async function add(infoBanner: HTMLElement): Promise<void> {
	const idFromUrl = /\/(?<id>[^/]+)\.(?:tsx|css)$/.exec(location.pathname)!.groups!.id;
	await addFeatureInformationWidget(infoBanner, idFromUrl);
}

async function addToIssueForm(mainContent: HTMLElement): Promise<void> {
	const idFromUrl = getFeatureNameFromIssueTitle()!;
	await addFeatureInformationWidget(mainContent, idFromUrl);
}

function init(signal: AbortSignal): void {
	observe('#repos-sticky-header', add, {signal});
}

function initIssueForm(signal: AbortSignal): void {
	observe('[data-testid="sidebar-assignees-section"]', addToIssueForm, {signal});
	// Avoid form content loss
	delegate('.rgh-feature-description a', 'click', openInNewTab);
}

const featureUrlRegex = /^(?:[/]refined-github){2}[/]blob[/][^/]+[/]source[/]features[/][^.]+[.](?:tsx|css)$/;

void features.add(import.meta.url, {
	include: [
		() => featureUrlRegex.test(location.pathname),
	],
	init,
}, {
	asLongAs: [
		isRefinedGitHubRepo,
		pageDetect.isNewIssue,
		() => Boolean(getFeatureNameFromIssueTitle()),
	],
	init: initIssueForm,
});

/*

## Test URLs

- Regular feature: https://github.com/refined-github/refined-github/blob/main/source/features/align-issue-labels.tsx
- CSS counterpart: https://github.com/refined-github/refined-github/blob/main/source/features/align-issue-labels.css
- CSS-only feature: https://github.com/refined-github/refined-github/blob/main/source/features/reactions-popup.css
- RGH feature: https://github.com/refined-github/refined-github/blob/main/source/features/rgh-feature-descriptions.css
- Removed feature: https://github.com/refined-github/refined-github/blob/55dfdfd903bd7d36e0c2f3dc46847bddc73544f5/source/features/latest-tag-button.tsx
- Bug report: https://github.com/refined-github/refined-github/issues/new?template=1_bug_report.yml&title=%60open-all-conversations%60%3A+Expected+elements
*/
