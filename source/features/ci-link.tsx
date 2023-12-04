import './ci-link.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $$, lastElement} from 'select-dom';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';
import fetchDom from '../helpers/fetch-dom.js';
import getChecks from './ci-link.gql';
import {buildRepoURL, getConversationNumber} from '../github-helpers/index.js';

async function getCommitWithChecks(): Promise<string | undefined> {
	const {repository} = await api.v4(getChecks);
	// Check earlier commits just in case the last one is CI-generated and doesn't have checks
	for (const commit of repository.defaultBranchRef.target.history.nodes) {
		if (commit.statusCheckRollup) {
			return commit.oid;
		}
	}

	return undefined;
}

async function addRepoIcon(anchor: HTMLElement): Promise<void> {
	const commit = await getCommitWithChecks();
	if (!commit) {
		return;
	}

	const endpoint = buildRepoURL('commits/checks-statuses-rollups');
	anchor.parentElement!.append(
		<span className="rgh-ci-link ml-1">
			<batch-deferred-content hidden data-url={endpoint}>
				<input
					name="oid"
					value={commit}
					data-targets="batch-deferred-content.inputs"
				/>
			</batch-deferred-content>
		</span>,
	);

	// A parent is clipping the popup
	anchor.closest('.AppHeader-context-full')?.style.setProperty('overflow', 'visible');
}

async function initRepo(signal: AbortSignal): Promise<void> {
	observe([
		// Desktop
		'.AppHeader-context-item:not([data-hovercard-type])',

		// Mobile. `> *:first-child` avoids finding our own element
		'.AppHeader-context-compact-mainItem > span:first-child',

		// Old selector: `.avatar` excludes "Global navigation update"
		// Repo title (aware of forks and private repos)
		'[itemprop="name"]:not(.avatar ~ [itemprop])',
	], addRepoIcon, {signal});
}

function addPRIcon(base?: DocumentFragment | HTMLElement): void {
	const selectBase = base instanceof DocumentFragment ? base : document.documentElement;
	const iconWrapper = lastElement('.TimelineItem .js-socket-channel[data-url]', selectBase);
	if (!iconWrapper) {
		return;
	}

	$('#partial-discussion-header')!.classList.add('rgh-pr-ci-link-added');

	const ciLinkCommitSha = /[a-f\d]{40}/.exec(iconWrapper.dataset.url!)![0];
	const prTitles = $$(`.js-issue-title:not([data-rgh-ci-link-commit="${ciLinkCommitSha}"])`); // Avoid duplicating CI link
	for (const title of prTitles) {
		if (title.dataset.rghCiLinkCommit) {
			title.lastElementChild!.remove(); // Drop outdated CI link
		}

		title.dataset.rghCiLinkCommit = ciLinkCommitSha;
		title.parentElement!.append(iconWrapper.cloneNode(true));
	}
}

async function fetchAndAddPrIcon(): Promise<void> {
	const prCommitListURL = buildRepoURL('pull', getConversationNumber()!) + '?' + String(Math.random()); // Break memoization to always fetch the latest DOM
	addPRIcon(await fetchDom(prCommitListURL));
}

async function initPR(signal: AbortSignal): Promise<void> {
	const ciLinkIsInDom = pageDetect.isPRConversation() || pageDetect.isPRCommitList();

	if (ciLinkIsInDom) {
		observe(':is(#discussion_bucket, #commits_bucket) .commit-build-statuses summary', addPRIcon, {signal});
	} else {
		await fetchAndAddPrIcon();
	}

	$('#partial-discussion-header')?.classList.add('rgh-pr-ci-link-added');
	observe('#partial-discussion-header:not(.rgh-pr-ci-link-added)', ciLinkIsInDom ? addPRIcon : fetchAndAddPrIcon, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init: initRepo,
}, {
	include: [
		pageDetect.isPR,
	],
	init: initPR,
});

/*

Test URLs

CI:
https://github.com/refined-github/refined-github

No CI:
https://github.com/fregante/.github

PR with CI:
https://github.com/refined-github/sandbox/pull/12

PR without CI:
https://github.com/refined-github/sandbox/pull/4

*/
