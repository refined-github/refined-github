import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import VersionsIcon from 'octicons-plain-react/Versions';
import {expectElement as $, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import api from '../github-helpers/api.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import previousVersionQuery from './previous-version.gql';
import onReactPageUpdate from '../github-events/on-react-page-update.js';

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

async function add(historyButton: HTMLAnchorElement, {signal}: SignalAsOptions): Promise<void> {
	if (elementExists('.rgh-previous-version')) {
		return;
	}

	const url = await getPreviousFileUrl();
	if (!url) {
		return;
	}

	const previousButton = historyButton.cloneNode(true);
	previousButton.classList.add('mr-n2', 'rgh-previous-version');
	previousButton.href = url;
	$('span[data-component="text"]', previousButton).textContent = 'Previous';
	$('span[data-component="leadingVisual"] svg', previousButton).replaceWith(
		<VersionsIcon/>,
	);
	historyButton.before(previousButton);

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
	observe('a:has([data-component="leadingVisual"] svg.octicon-history)', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	init,
});

/*

Test URL

https://github.com/refined-github/refined-github/blob/main/readme.md

*/
