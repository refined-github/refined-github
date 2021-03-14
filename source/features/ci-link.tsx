import './ci-link.css';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {buildRepoURL, getPRNumber} from '../github-helpers';

// Look for the CI icon in the latest 2 days of commits #2990
const getRepoCIIcon = onetime(async () => fetchDom(
	buildRepoURL('commits'), [
		'.commit-group:nth-of-type(-n+2) .commit-build-statuses', // Pre "Repository refresh" layout
		'.TimelineItem--condensed:nth-of-type(-n+2) .commit-build-statuses'
	].join()
));

const getPRCIIcon = onetime(async () => fetchDom(
	buildRepoURL('pull', getPRNumber().slice(1), 'commits'), '.js-commits-list-item:last-of-type .commit-build-statuses'
));

async function initRepo(): Promise<false | void> {
	const icon = await getRepoCIIcon() as HTMLElement | undefined;
	if (!icon) {
		return false;
	}

	icon.classList.add('rgh-ci-link');
	if (onetime.callCount(getRepoCIIcon) > 1) {
		icon.style.animation = 'none';
	}

	// Append to title (aware of forks and private repos)
	select('[itemprop="name"]')!.parentElement!.append(icon);
}

async function initPR(): Promise<false | void> {
	const icon = await getPRCIIcon() as HTMLElement | undefined;
	if (!icon) {
		return false;
	}

	icon.classList.add('rgh-ci-link');
	if (onetime.callCount(getRepoCIIcon) > 1) {
		icon.style.animation = 'none';
	}

	// Append to PR title and floating header
	select('.gh-header-title')!.append(icon);
	select('.gh-header-number')!.after(icon.cloneNode(true));
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo
	],
	exclude: [
		pageDetect.isEmptyRepo
	],
	awaitDomReady: false,
	init: initRepo
}, {
	include: [
		pageDetect.isPR
	],
	awaitDomReady: false,
	init: initPR
});
