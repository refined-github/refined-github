import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {VersionsIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import api from '../github-helpers/api.js';
import GitHubURL from '../github-helpers/github-url.js';

async function getPreviousCommitForFile(pathname: string): Promise<string | false> {
	const {user, repository, branch, filePath} = new GitHubURL(pathname);
	const {resource} = await api.v4(`
		query getPreviousCommitForFile($resource: URI!, $filePath: String!) {
			resource(url: $resource) {
				... on Commit {
					history(path: $filePath, first: 2) {
						nodes {
							oid
						}
					}
				}
			}
		}
	`, {
		variables: {
			filePath,
			resource: `/${user}/${repository}/commit/${branch}`,
		},
	});

	if (resource.history.nodes.length < 2) {
		return false;
	}

	// The first commit refers to the current one, so we skip it
	return resource.history.nodes[1].oid;
}

async function add(historyButton: HTMLElement): Promise<void> {
	const previousCommit = await getPreviousCommitForFile(location.href);

	if (!previousCommit) {
		return;
	}

	const url = new GitHubURL(location.href)
		.assign({branch: previousCommit});

	historyButton.before(
		<a href={url.href} className="UnderlineNav-item tooltipped tooltipped-n ml-2" aria-label="View previous version">
			<VersionsIcon className="UnderlineNav-octicon mr-0"/>
		</a>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('a[aria-label="History"].react-last-commit-history-group', add, {signal});
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
