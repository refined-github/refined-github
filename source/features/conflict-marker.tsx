/**
@description Shows which PRs have conflicts in PR lists.
@screenshot https://github-production-user-asset-6210df.s3.amazonaws.com/83146190/253128438-d67c8f49-44f1-4e15-9363-a717109fef39.png
*/

import './conflict-marker.css';

import batchedFunction from 'batched-function';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import AlertIcon from 'octicons-plain-react/Alert';

import {withTooltipRef} from '../components/tooltip.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {commentBoxHashPr, openPrsListLink} from '../github-helpers/selectors.js';
import observe from '../helpers/selector-observer.js';

async function addIcon(links: HTMLAnchorElement[]): Promise<void> {
	const prConfigs = links.map(link => {
		const [, owner, name, , prNumber] = link.pathname.split('/', 5);
		const key = api.escapeKey(owner, name, prNumber);
		return {
			key,
			link,
			owner,
			name,
			number: Number(prNumber),
		};
	});

	const batchQuery = prConfigs.map(({key, owner, name, number}) => `
		${key}: repository(owner: "${owner}", name: "${name}") {
			pullRequest(number: ${number}) {
				mergeable
				state
				isDraft
			}
		}
	`).join('\n');

	const data = await api.v4(batchQuery);

	for (const pr of prConfigs) {
		const {mergeable, state, isDraft} = data[pr.key].pullRequest;
		if (mergeable === 'CONFLICTING' && (state === 'OPEN' || isDraft)) {
			pr.link.after(
				<a
					ref={withTooltipRef({label: 'This PR has conflicts that must be resolved', direction: 'e'})}
					className="rgh-conflict-marker color-fg-muted ml-2 tmp-ml-2"
					href={pr.link.pathname + commentBoxHashPr}
				>
					<AlertIcon className="v-align-middle" />
				</a>,
			);
		}
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe(openPrsListLink, batchedFunction(addIcon, {delay: 100}), {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	requiresToken: true,
	init,
});

/*
Test URLs
https://github.com/pulls
https://github.com/refined-github/sandbox/pulls?q=is%3Apr+is%3Aopen+conflict
https://github.com/refined-github/sandbox/issues?q=conflict
https://github.com/kubernetes/kubernetes/milestone/62
*/
