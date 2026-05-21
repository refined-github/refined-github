import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import DiffIcon from 'octicons-plain-react/Diff';
import {$closestOptional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {getCleanPathname} from '../github-helpers/index.js';
import {tooltipped} from '../helpers/tooltip.js';
import observe from '../helpers/selector-observer.js';

function getDiffsHubUrl(pathname = getCleanPathname()): string {
	const url = new URL(location.href);
	url.hostname = 'diffshub.com';
	url.protocol = 'https:';
	url.pathname = pathname;
	return url.href;
}

function cloneTab(tab: HTMLAnchorElement, href: string): HTMLAnchorElement {
	const clone = tab.cloneNode(false);
	clone.classList.add('rgh-diffshub-button');
	clone.classList.remove('selected', 'prc-TabNav-Selected-LYsaH');
	clone.removeAttribute('aria-selected');
	clone.removeAttribute('role');
	clone.removeAttribute('tabindex');
	clone.removeAttribute('data-discover');
	clone.removeAttribute('data-hydro-click');
	clone.removeAttribute('data-hydro-click-hmac');
	clone.removeAttribute('id');
	clone.href = href;
	clone.dataset.turbo = 'false';
	return clone;
}

function addPrTab(filesTab: HTMLAnchorElement): void {
	if (elementExists('.rgh-diffshub-button', filesTab.parentElement!)) {
		return;
	}

	const pathname = getCleanPathname().replace(/\/files$/, '');
	const tab = cloneTab(filesTab, getDiffsHubUrl(pathname));
	tab.append(<DiffIcon className="mr-2" />, ' DiffsHub');

	filesTab.after(tooltipped('Open this pull request on DiffsHub', tab));
}

function addCompareButton(referencePicker: HTMLElement): void {
	const rangeEditor = $closestOptional('.range-editor', referencePicker);
	if (!rangeEditor || elementExists('.rgh-diffshub-button', rangeEditor)) {
		return;
	}

	const nextElement = referencePicker.nextElementSibling;
	// The swap button might not have been added yet.
	const insertionPoint = nextElement?.textContent.trim() === 'Swap'
		? nextElement
		: referencePicker;

	insertionPoint.after(
		tooltipped(
			'Open this comparison on DiffsHub',
			<a
				href={getDiffsHubUrl()}
				className="btn btn-sm rgh-diffshub-button ml-2"
				data-turbo="false"
			>
				<DiffIcon /> DiffsHub
			</a>,
		),
	);
}

function addCommitButton(searchInput: HTMLElement): void {
	const toolbar = $closestOptional('.position-sticky', searchInput);
	const controls = $closestOptional('.width-full', searchInput);
	if (!toolbar || !controls || elementExists('.rgh-diffshub-button', toolbar)) {
		return;
	}

	controls.append(
		tooltipped(
			'Open this commit on DiffsHub',
			<a
				href={getDiffsHubUrl()}
				className="btn btn-sm rgh-diffshub-button"
				data-turbo="false"
			>
				<DiffIcon /> DiffsHub
			</a>,
		),
	);
}

function initCommit(signal: AbortSignal): void {
	observe('input[placeholder="Search within code"]', addCommitButton, {signal});
}

function initCompare(signal: AbortSignal): void {
	observe('.range-editor .d-inline-block + .range-cross-repo-pair', addCompareButton, {signal});
}

function initPrTabs(signal: AbortSignal): void {
	observe([
		'a#prs-files-anchor-tab',
		'[aria-label="Pull request tabs"] [role="tablist"] a[href$="/files"]',
		'[aria-label="Pull request tabs"] [role="tablist"] a[href$="/changes"]',
		'[aria-label="Pull request navigation tabs"] [role="tablist"] a[href$="/files"]',
		'[aria-label="Pull request navigation tabs"] [role="tablist"] a[href$="/changes"]',
	], addPrTab, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
	],
	exclude: [
		pageDetect.isPRFile404,
	],
	init: initPrTabs,
}, {
	include: [
		pageDetect.isCompare,
	],
	init: initCompare,
}, {
	include: [
		pageDetect.isSingleCommit,
	],
	init: initCommit,
});

/*
# Test URLs

- PR: https://github.com/refined-github/refined-github/pull/6261
- Compare: https://github.com/rancher/rancher/compare/v2.6.5...v2.6.6
- Single commit: https://github.com/rancher/rancher/commit/e82921075436c21120145927d5a66037661fcf4e
*/
