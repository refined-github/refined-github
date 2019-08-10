import select from 'select-dom';
import React from 'dom-chef';
import * as api from '../libs/api';
import {getOwnerAndRepo, getRepoURL} from '../libs/utils';
import features from '../libs/features';
import {alert} from '../libs/icons';

function getPrNumber(pr: string): string {
	return pr.replace('issue_', '');
}

function buildQuery(
	prs: string[],
): string {
	const {ownerName, repoName} = getOwnerAndRepo();
	return `
		repository(owner: "${ownerName}", name: "${repoName}") {
			${prs.map((pr: string) => `
				${pr}: pullRequest(number: ${getPrNumber(pr)}) {
					mergeable
				}
			`)}
		}
	`;
}

async function init(): Promise<false | void> {
	const elements = select.all('.js-issue-row');
	if (elements.length === 0) {
		return false;
	}

	const query = buildQuery(elements.map(e => e.id));
	const {repository} = await api.v4(query);

	for (const pr of elements) {
		if (repository[pr.id].mergeable === 'CONFLICTING') {
			select('.d-inline-block.mr-1 > .commit-build-statuses', pr)!.before(
				<a
					className="tooltipped tooltipped-n m-0 text-gray mr-2"
					aria-label="This PR has conflicts that must be resolved"
					href={`/${getRepoURL()}/pull/${getPrNumber(pr.id)}#partial-pull-merging`}
				>
					{alert()}
				</a>
			);
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Shows which PRs have conflicts in PR lists',
	screenshot: 'https://user-images.githubusercontent.com/9092510/62777551-2affe500-baae-11e9-8ba4-67f078347913.png',
	include: [
		features.isPRList
	],
	load: features.onAjaxedPages,
	init
});
