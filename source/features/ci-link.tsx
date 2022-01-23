import './ci-link.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {onCiIconLoad} from '../github-events/on-fragment-load';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {buildRepoURL, getCurrentCommittish} from '../github-helpers';

// Look for the CI icon in the latest 2 days of commits #2990
const iconSelector = [
	'.TimelineItem--condensed:nth-of-type(-n+2) .commit-build-statuses', // TODO[2022-04-29]: GHE #4294
	'.TimelineItem--condensed:nth-of-type(-n+2) batch-deferred-content[data-url$="checks-statuses-rollups"]',
].join(',');

async function getIcon(): Promise<HTMLElement | undefined> {
	if (pageDetect.isRepoCommitList() && getCurrentCommittish() === await getDefaultBranch()) {
		return select(iconSelector)!.cloneNode(true);
	}

	const dom = await fetchDom(buildRepoURL('commits'));
	const icon = select(iconSelector, dom);
	if (icon && (pageDetect.isDiscussion() || pageDetect.isDiscussionList())) {
		const style = select('link[href*="/assets/github-"]', dom)!;
		document.head.append(style); // #5283
	}

	return icon;
}

function appendIconToRepoHeader(icon: HTMLElement): void {
	// Append to title (aware of forks and private repos)
	const repoNameHeader = select('[itemprop="name"]')!.parentElement!;
	repoNameHeader.append(icon);
	repoNameHeader.classList.add('rgh-ci-link');
}

async function init(): Promise<false | void> {
	const icon = await getIcon();
	if (!icon) {
		return false;
	}

	appendIconToRepoHeader(icon);
}

function initRepoHome(): void | false {
	const icon = select('.file-navigation + .Box .commit-build-statuses');
	if (!icon) {
		return false;
	}

	const clonedIcon = icon.cloneNode(true);
	// Fix the dropdown orientation
	select('.dropdown-menu', clonedIcon)!.classList.replace('dropdown-menu-sw', 'dropdown-menu-se');
	appendIconToRepoHeader(clonedIcon);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		pageDetect.isRepoHome,
		pageDetect.isEmptyRepo,
	],
	awaitDomReady: false,
	init,
}, {
	include: [
		pageDetect.isRepoHome,
	],
	exclude: [
		pageDetect.isEmptyRepo,
	],
	additionalListeners: [
		onCiIconLoad,
	],
	awaitDomReady: false,
	onlyAdditionalListeners: true,
	init: initRepoHome,
});
