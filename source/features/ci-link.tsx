import './ci-link.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import * as api from '../github-helpers/api.js';
import {buildRepoURL} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

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

async function add(anchor: HTMLElement): Promise<void> {
	const endpoint = buildRepoURL('commits/checks-statuses-rollups');
	anchor.parentElement!.append(
		<span className="rgh-ci-link">
			<batch-deferred-content hidden data-url={endpoint}>
				<input
					name="oid"
					value={await getHead()}
					data-targets="batch-deferred-content.inputs"
				/>
			</batch-deferred-content>
		</span>,
	);

	// A parent is clipping the popup
	anchor.closest('.AppHeader-context-full')?.style.setProperty('overflow', 'visible');
}

async function init(signal: AbortSignal): Promise<void> {
	observe([
		// Desktop
		'.AppHeader-context-item:not([data-hovercard-type])',

		// Mobile. `:first-child` avoids finding our own element
		'.AppHeader-context-compact-mainItem span:first-child',

		// Old selector: `.avatar` excludes "Global navigation update"
		// Repo title (aware of forks and private repos)
		'[itemprop="name"]:not(.avatar ~ [itemprop])',
	], add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
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
