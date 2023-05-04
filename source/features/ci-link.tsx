import './ci-link.css';
import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import * as api from '../github-helpers/api.js';
import {buildRepoURL} from '../github-helpers/index.js';
import attachElement from '../helpers/attach-element.js';

async function getHead(): Promise<string> {
	const {repository} = await api.v4(`
		repository() {
			defaultBranchRef {
				target {
					oid
				}
			}
		}
	`);

	return repository.defaultBranchRef.target.oid;
}

function getCiDetails(commit: string): HTMLElement {
	const endpoint = buildRepoURL('commits/checks-statuses-rollups');
	return (
		// `span` also required by `attachElement`’s deduplicator
		<span className="rgh-ci-link">
			<batch-deferred-content hidden data-url={endpoint}>
				<input
					name="oid"
					value={commit}
					data-targets="batch-deferred-content.inputs"
				/>
			</batch-deferred-content>
		</span>
	);
}

async function init(): Promise<void | false> {
	const head = await getHead();
	// `.avatar` disables it on "Global navigation update" until #6454
	const repoTitle = await elementReady('[itemprop="name"]:not(.avatar ~ [itemprop])');
	if (!repoTitle) {
		return false;
	}

	attachElement(
		// Append to repo title (aware of forks and private repos)
		repoTitle.parentElement,
		{append: () => getCiDetails(head)},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	exclude: [
		pageDetect.isEmptyRepo,
	],
	init,
});

/*
Test URLs

CI:
https://github.com/refined-github/refined-github

No CI:
https://github.com/fregante/.github
*/
