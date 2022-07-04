import './ci-link.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {buildRepoURL, getCurrentCommittish} from '../github-helpers';

// Look for the CI details dropdown in the latest 2 days of commits #2990
const ciDetailsSelector = '.TimelineItem--condensed:nth-of-type(-n+2) batch-deferred-content[data-url$="checks-statuses-rollups"]';

async function getCiDetails(): Promise<HTMLElement | undefined> {
	if (pageDetect.isRepoHome()) {
		const ciDetails = select([
			'.file-navigation + .Box .commit-build-statuses', // Select the CI details if they're already loaded
			'.file-navigation + .Box .js-details-container include-fragment[src*="/rollup?"]', // Otherwise select the include-fragment
		].join(','));
		if (ciDetails) {
			return ciDetails.cloneNode(true);
		}
	}

	if (pageDetect.isRepoCommitList() && getCurrentCommittish() === await getDefaultBranch()) {
		const ciDetails = select(ciDetailsSelector);
		if (ciDetails) {
			return ciDetails.cloneNode(true);
		}
	}

	const dom = await fetchDom(buildRepoURL('commits'));
	const ciDetails = select(ciDetailsSelector, dom);
	if (ciDetails && (pageDetect.isDiscussion() || pageDetect.isDiscussionList())) {
		const style = select('link[href*="/assets/github-"]', dom)!;
		document.head.append(style); // #5283
	}

	return ciDetails;
}

async function init(): Promise<false | void> {
	const ciDetails = await getCiDetails();
	if (!ciDetails) {
		return false;
	}

	// Append to repo title (aware of forks and private repos)
	const repoNameHeader = select('[itemprop="name"]')!.parentElement!;
	repoNameHeader.append(ciDetails);
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
