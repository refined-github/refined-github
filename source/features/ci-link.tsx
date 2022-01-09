import './ci-link.css';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {buildRepoURL, getCurrentCommittish} from '../github-helpers';

async function getIcon(): Promise<HTMLElement | void> {
	// Look for the CI icon in the latest 2 days of commits #2990
	const iconSelector = [
		'.TimelineItem--condensed:nth-of-type(-n+2) .commit-build-statuses', // TODO[2022-04-29]: GHE #4294
		'.TimelineItem--condensed:nth-of-type(-n+2) batch-deferred-content[data-url$="checks-statuses-rollups"]',
	].join(',');

	if (pageDetect.isRepoHome()) {
		const icon = await elementReady('.file-navigation + .Box .commit-build-statuses', {
			stopOnDomReady: false,
			timeout: 10_000,
		});

		if (icon) {
			return icon.cloneNode(true);
		}
	}

	if (pageDetect.isRepoCommitList() && getCurrentCommittish() === await getDefaultBranch()) {
		const icon = await elementReady(iconSelector);
		return icon!.cloneNode(true);
	}

	const dom = await fetchDom(buildRepoURL('commits'));

	if (pageDetect.isDiscussion() || pageDetect.isDiscussionList()) {
		const style = select('link[href*="/assets/github-"]', dom)!;
		document.head.append(style);
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments -- Rule doesn't respect overloads
	return select<HTMLElement>(iconSelector, dom);
}

async function init(): Promise<false | void> {
	const icon = await getIcon();
	if (!icon) {
		return false;
	}

	// Append to title (aware of forks and private repos)
	const repoNameHeader = select('[itemprop="name"]')!.parentElement!;
	repoNameHeader.append(icon);
	repoNameHeader.classList.add('rgh-ci-link');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		pageDetect.isEmptyRepo,
	],
	awaitDomReady: false,
	init,
});
