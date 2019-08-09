import select from 'select-dom';
import React from 'dom-chef';
import * as api from '../libs/api';
import {getOwnerAndRepo, getRepoURL} from '../libs/utils';
import features from '../libs/features';
import {alert} from '../libs/icons';

const CONFLICTING = 'CONFLICTING';

function getPrNumber(pr: string): string {
	return pr.replace('issue_', '');
}

function buildQuery(
	ownerName: string,
	repoName: string,
	prs: string[],
): string {
	return `
		query {
			repository(owner: "${ownerName}", name: "${repoName}") {
				${prs.map((pr: string) => `
						${pr}: pullRequest(number: ${getPrNumber(pr)}) {
							mergeable
						}
					`,
	)}
			}
		}
	`;
}

async function init(): Promise<false | void> {
	const elements = select.all('.js-issue-row');
	if (elements.length === 0) {
		return false;
	}

	const {ownerName, repoName} = getOwnerAndRepo();

	const query = buildQuery(ownerName, repoName, elements.map(e => e.id));

	const data = await api.v4(query);

	for (const pr of elements) {
		if (data.repository[pr.id].mergeable === CONFLICTING) {
			select('.d-inline-block.mr-1 > .commit-build-statuses', pr)!.before(
				<a
					className="tooltipped tooltipped-s m-0 text-gray mr-2"
					aria-label="This PR has conflicts that must be resolved"
					href={`/${getRepoURL()}/pull/${getPrNumber(pr.id)}#partial-pull-merging`}
				>
					{alert()}
				</a>,
			);
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Shows which PRs have conflicts in PR lists',
	screenshot: 'https://user-images.githubusercontent.com/9092510/62777389-aad97f80-baad-11e9-9014-14d0b7eb033b.png',
	include: [
		features.isPRList
	],
	load: features.onAjaxedPages,
	init
});
