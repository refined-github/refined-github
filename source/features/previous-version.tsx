import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import VersionsIcon from 'octicons-plain-react/Versions';
import {expectElement as $} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import api from '../github-helpers/api.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import previousVersionQuery from './previous-version.gql';

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

async function add(historyButton: HTMLAnchorElement): Promise<void> {
	const previousCommit = await getPreviousCommitForFile(location.href);
	if (!previousCommit) {
		return;
	}

	const url = new GitHubFileURL(location.href)
		.assign({branch: previousCommit});

	const previousButton = historyButton.cloneNode(true);
	previousButton.href = url.href;
	$('span[data-component="text"]', previousButton).textContent = 'Previous';
	$('span[data-component="leadingVisual"] svg', previousButton).replaceWith(
		<VersionsIcon className="UnderlineNav-octicon mr-0"/>,
	);
	historyButton.before(previousButton);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('a:has([data-component="leadingVisual"] svg.octicon-history)', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	exclude: [
		pageDetect.isRepoFile404,
	],
	init,
});

/*

Test URL

https://github.com/refined-github/refined-github/blob/main/readme.md

*/
