import './ci-link.css';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {buildRepoURL, getConversationNumber} from '../github-helpers';

const deinit: VoidFunction[] = [];

// Look for the CI icon in the latest 2 days of commits #2990
const getRepoIcon = onetime(async () => fetchDom<HTMLElement>(
	buildRepoURL('commits'), [
		'.commit-group:nth-of-type(-n+2) .commit-build-statuses', // Pre "Repository refresh" layout
		'.TimelineItem--condensed:nth-of-type(-n+2) .commit-build-statuses'
	].join()
));

const getPRIcon = onetime(async () => select(
	'.js-commits-list-item:last-of-type .commit-build-statuses',
	pageDetect.isPRCommitList() ? document : await fetchDom(
		buildRepoURL('pull', getConversationNumber()!, 'commits')
	)
));

async function initRepo(): Promise<false | void> {
	const icon = await getRepoIcon();
	if (!icon) {
		return false;
	}

	icon.classList.add('rgh-ci-link');
	if (onetime.callCount(getRepoIcon) > 1) {
		icon.style.animation = 'none';
	}

	// Append to title (aware of forks and private repos)
	select('[itemprop="name"]')!.parentElement!.append(icon);
}

async function initPR(): Promise<false | void> {
	const icon = await getPRIcon() as HTMLElement | undefined;
	if (!icon) {
		return false;
	}

	icon.classList.add('rgh-ci-link', 'ml-2');
	if (onetime.callCount(getPRIcon) > 1) {
		icon.style.animation = 'none';
	}

	const headerIcon = icon.cloneNode(true);
	headerIcon.style.animation = 'none';

	deinit.push(observe('.gh-header-title .f1-light:not(.rgh-ci-link-heading)', {
		// Append to PR title
		add(heading) {
			heading.classList.add('rgh-ci-link-heading');
			heading.append(icon);
		}
	}).abort, observe('.js-sticky h1:not(.rgh-ci-link-heading)', {
		// Append to PR sticky header
		add(heading) {
			heading.classList.add('rgh-ci-link-heading');
			heading.append(headerIcon);
		}
	}).abort);
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
	init: initPR,
	deinit
});
