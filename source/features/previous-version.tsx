import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {VersionsIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';

async function getPreviousCommitForFile(pathname: string): Promise<string> {
	const {user, repository, branch, filePath} = new GitHubURL(pathname);
	const {resource} = await api.v4(`
		resource(url: "/${user}/${repository}/commit/${branch}") {
			... on Commit {
				history(path: "${filePath}", first: 2) {
					nodes {
						oid
					}
				}
			}
		}
	`);

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
