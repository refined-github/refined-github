import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {VersionsIcon} from '@primer/octicons-react';

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

async function add(historyButton: HTMLElement): Promise<void> {
	const previousCommit = await getPreviousCommitForFile(location.href);
	if (!previousCommit) {
		return;
	}

	const url = new GitHubFileURL(location.href)
		.assign({branch: previousCommit});

	historyButton.before(
		<a href={url.href} className="UnderlineNav-item tooltipped tooltipped-n ml-2" aria-label="View previous version">
			<VersionsIcon className="UnderlineNav-octicon mr-0"/>
		</a>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('a.react-last-commit-history-group', add, {signal});
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
