import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import VersionsIcon from 'octicons-plain-react/Versions';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import api from '../github-helpers/api.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import previousVersionQuery from './previous-version.gql';
import onReactPageUpdate from '../github-events/on-react-page-update.js';
import {expectToken} from '../github-helpers/github-token.js';

import {$} from 'select-dom/strict.js';
async function getPreviousCommitForFile(pathname: string): Promise<string | undefined> {
	const {user, repository, branch, filePath} = new GitHubFileURL(pathname);
	const {resource} = await api.v4(previousVersionQuery, {
		variables: {
			filePath,
			resource: `/${user}/${repository}/commit/${branch}`,
		},
	});

	// The first commit refers to the current one, so we skip it
	return resource.history.nodes[1]?.oid;
}

async function getPreviousFileUrl(): Promise<string | void> {
	const previousCommit = await getPreviousCommitForFile(location.href);
	if (!previousCommit) {
		return;
	}

	return new GitHubFileURL(location.href)
		.assign({branch: previousCommit})
		.href;
}

function addMobileDom(wrappedHistoryButton: HTMLElement): HTMLAnchorElement {
	const wrappedPreviousButton = wrappedHistoryButton.cloneNode(true);
	wrappedPreviousButton.setAttribute('aria-label', 'Previous version');
	const previousButton = $('a', wrappedPreviousButton);
	previousButton.classList.add('rgh-previous-version-mobile');
	wrappedHistoryButton.before(wrappedPreviousButton);
	return previousButton;
}

function addDesktopDom(historyButton: HTMLAnchorElement): HTMLAnchorElement {
	const previousButton = historyButton.cloneNode(true);
	previousButton.classList.add('mr-n2', 'rgh-previous-version-desktop');
	$('span[data-component="text"]', previousButton).textContent = 'Previous';
	historyButton.before(previousButton);
	return previousButton;
}

async function add(historyButton: HTMLAnchorElement, {signal}: SignalAsOptions): Promise<void> {
	const url = await getPreviousFileUrl();
	if (!url) {
		return;
	}

	// The button might be labeled or inside a role="tooltip" element.
	// If it has a tooltip, we need to clone the tooltip element itself, not the button.
	const wrappedHistoryButton = historyButton.closest('[role="tooltip"]');

	if ($optional(wrappedHistoryButton ? '.rgh-previous-version-mobile' : '.rgh-previous-version-desktop')) {
		return;
	}

	const previousButton = wrappedHistoryButton
		? addMobileDom(wrappedHistoryButton)
		: addDesktopDom(historyButton);

	previousButton.href = url;
	$('span[data-component="leadingVisual"] svg', previousButton).replaceWith(
		<VersionsIcon />,
	);

	onReactPageUpdate(async pageUnload => {
		const url = await getPreviousFileUrl();
		if (pageUnload.aborted) {
			return;
		}

		if (url) {
			previousButton.href = url;
		}

		previousButton.hidden = !url;
	}, signal!);
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe('a:has([data-component="leadingVisual"] svg.octicon-history)', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
		pageDetect.isRepoTree,
		pageDetect.isBlame,
	],
	exclude: [
		pageDetect.isRepoHome,
	],
	init,
});

/*

Test URL

https://github.com/refined-github/refined-github/tree/main/source
https://github.com/refined-github/refined-github/blob/main/readme.md

*/
