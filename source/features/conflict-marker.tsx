import './conflict-marker.css';
import React from 'dom-chef';
import {AlertIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';
import getPRConfig from './conflict-marker.gql';

async function addConflictMarker(link: HTMLAnchorElement): Promise<void> {
	const [, user, repo, , prNumber] = link.pathname.split('/');
	const {repository: data} = await api.v4(getPRConfig, {
		variables: {
			_owner: user,
			_name: repo,
			prNumber: Number.parseInt(prNumber, 10),
		},
	});

	if (data.pullRequest.mergeable === 'CONFLICTING') {
		link.after(
			<a
				className="rgh-conflict-marker tooltipped tooltipped-e color-fg-muted ml-2"
				aria-label="This PR has conflicts that must be resolved"
				href={`${link.pathname}#partial-pull-merging`}
			>
				<AlertIcon className="v-align-middle"/>
			</a>,
		);
	}
}

function init(signal: AbortSignal): void {
	observe('.js-issue-row:has(.octicon-git-pull-request.color-fg-open) a.js-navigation-open', addConflictMarker, {signal});
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
