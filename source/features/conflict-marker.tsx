import './conflict-marker.css';
import select from 'select-dom';
import React from 'dom-chef';
import * as api from '../libs/api';
import {getOwnerAndRepo} from '../libs/utils';
import features from '../libs/features';
import {merge} from '../libs/icons';

const CONFLICTING = 'CONFLICTING';

function buildQuery(
	ownerName: string,
	repoName: string,
	prs: string[],
): string {
	return `
		query {
			repository(owner: "${ownerName}", name: "${repoName}") {
				${prs.map(
		(pr: string) => `
						${pr}: pullRequest(number: ${pr.replace('issue_', '')}) {
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
				<span
					className="tooltipped tooltipped-s rgh-conflict-marker v-align-middle"
					aria-label="The PR can be merged but only after resolving the conflicts."
				>
					{merge()}
				</span>,
			);
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Shows which PRs have conflicts in PR lists',
	screenshot: 'https://user-images.githubusercontent.com/9092510/62647237-62587f80-b950-11e9-9f66-cb99f008e19d.png',
	include: [
		features.isPRList
	],
	load: features.onAjaxedPages,
	init
});
