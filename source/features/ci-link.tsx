import './ci-link.css';
import select from 'select-dom';
import onetime from 'onetime';
import domLoaded from 'dom-loaded';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';
import {buildRepoURL, getConversationNumber} from '../github-helpers';

// Look for the CI icon in the latest 2 days of commits #2990
const getRepoIcon = onetime(async () => fetchDom(
	buildRepoURL('commits'), [
		'.commit-group:nth-of-type(-n+2) .commit-build-statuses', // Pre "Repository refresh" layout
		'.TimelineItem--condensed:nth-of-type(-n+2) .commit-build-statuses'
	].join()
));

const getPRIcon = onetime(async () => {
	let base;
	if (pageDetect.isPRCommitList()) {
		await domLoaded;
		base = document;
	} else {
		base = await fetchDom(buildRepoURL('pull', getConversationNumber()!, 'commits'));
	}

	// TS bug does not allow us to directly return this 🤷‍♂️
	const icon = select.last('.js-commits-list-item batch-deferred-content[data-url$="commits/checks-statuses-rollups"]', base);
	return icon;
});

async function initPR(): Promise<false | void> {
	const icon = await getPRIcon();
	if (!icon) {
		return false;
	}

	icon.classList.add('rgh-ci-link', 'ml-2');
	if (onetime.callCount(getPRIcon) > 1) {
		icon.style.animation = 'none';
	}

	const headers = select.all(':is(.gh-header-title .f1-light, .js-sticky h1):not(.rgh-ci-link-heading)');
	for (const header of headers) {
		header.classList.add('rgh-ci-link-heading');

		const headerIcon = icon.cloneNode(true);
		headerIcon.style.animation = 'none';
		header.append(headerIcon);
	}
}

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
	additionalListeners: [
		onConversationHeaderUpdate
	],
	awaitDomReady: false,
	init: initPR
});
