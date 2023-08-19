import './conflict-marker.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import select from 'select-dom';
import {AlertIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';

// NOTE: cannot separate to gql: https://github.com/refined-github/refined-github/pull/6839#issuecomment-1683684796
function createQueryFragment(prKey: string, owner: string, name: string, prNumber: number): string {
	return `
		${prKey}: repository(owner: "${owner}", name: "${name}") {
			pullRequest(number: ${prNumber}) {
				mergeable
			}
		}
	`;
}

async function addConflictMarkers(container: HTMLDivElement): Promise<void> {
	const links = select.all('.js-issue-row:has(.octicon-git-pull-request.color-fg-open) a.js-navigation-open', container);

	if (links.length === 0) {
		return;
	}

	const prConfigs = links.map(link => {
		const [, user, repo, , prNumber] = link.pathname.split('/');
		const key = api.escapeKey(user, repo, prNumber);
		return {
			key, user, repo, number: Number.parseInt(prNumber, 10), link,
		};
	});

	const batchQuery = prConfigs.map(prConfig =>
		createQueryFragment(prConfig.key, prConfig.user, prConfig.repo, prConfig.number),
	).join('\n');

	const data = await api.v4(batchQuery);

	for (const pr of prConfigs) {
		if (data[pr.key].pullRequest.mergeable === 'CONFLICTING') {
			pr.link.after(
				<a
					className="rgh-conflict-marker tooltipped tooltipped-e color-fg-muted ml-2"
					aria-label="This PR has conflicts that must be resolved"
					href={`${pr.link.pathname}#partial-pull-merging`}
				>
					<AlertIcon className="v-align-middle"/>
				</a>,
			);
		}
	}
}

function init(signal: AbortSignal): void {
	observe('#js-issues-toolbar', addConflictMarkers, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	exclude: [
		pageDetect.isBlank,
	],
	init,
});

/*
Test URLs
https://github.com/pulls
https://github.com/refined-github/refined-github/pulls
*/
