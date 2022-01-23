import './ci-link.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {buildRepoURL, getCurrentCommittish} from '../github-helpers';

// Look for the CI details dropdown in the latest 2 days of commits #2990
const ciDetailsSelector = [
	'.TimelineItem--condensed:nth-of-type(-n+2) .commit-build-statuses', // TODO[2022-04-29]: GHE #4294
	'.TimelineItem--condensed:nth-of-type(-n+2) batch-deferred-content[data-url$="checks-statuses-rollups"]',
].join(',');

async function getCiDetails(): Promise<HTMLElement | undefined> {
	if (pageDetect.isRepoHome()) {
		// Clone the CI details if they're already loaded, otherwise clone the include-fragment
		return select('.file-navigation + .Box :is(.commit-build-statuses, .js-details-container include-fragment[src*="/rollup?"])')!.cloneNode(true);
	}

	if (pageDetect.isRepoCommitList() && getCurrentCommittish() === await getDefaultBranch()) {
		return select(ciDetailsSelector)!.cloneNode(true);
	}

	const dom = await fetchDom(buildRepoURL('commits'));
	const ciDetails = select(ciDetailsSelector, dom);
	if (ciDetails && (pageDetect.isDiscussion() || pageDetect.isDiscussionList())) {
		const style = select('link[href*="/assets/github-"]', dom)!;
		document.head.append(style); // #5283
	}

	return ciDetails;
}

function appendCiDetailsToRepoTitle(ciDetails: HTMLElement): void {
	// Append to title (aware of forks and private repos)
	const repoNameHeader = select('[itemprop="name"]')!.parentElement!;
	repoNameHeader.append(ciDetails);
	repoNameHeader.classList.add('rgh-ci-link');
}

async function init(): Promise<false | void> {
	const ciDetails = await getCiDetails();
	if (!ciDetails) {
		return false;
	}

	appendCiDetailsToRepoTitle(ciDetails);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		// PageDetect.isRepoHome,
		pageDetect.isEmptyRepo,
	],
	awaitDomReady: false,
	init,
});
