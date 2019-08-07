import './merge-status.css';
import select from 'select-dom';
import React from 'dom-chef';
import * as api from '../libs/api';
import { getOwnerAndRepo } from '../libs/utils';
import features from '../libs/features';

const CONFLICTING = 'CONFLICTING';

function buildQuery(ownerName: string, repoName: string, prs: string[]) {
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

	const { ownerName, repoName } = getOwnerAndRepo();

	const query = buildQuery(ownerName, repoName, elements.map(e => e.id));

	const data = await api.v4(query);

	for (const pr of elements) {
		if (data.repository[pr.id].mergeable === CONFLICTING) {
			select('.d-inline-block.mr-1 > .commit-build-statuses', pr)!.before(
				<span
					className="timeline-comment-label tooltipped tooltipped-s rgh-merge-conflicts-label"
					aria-label="This PR cannot be merged because of conflicts."
				>
					Merge conflicts
				</span>,
			);
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Shows merging status of a PR',
	// TODO: Add screenshot
	screenshot: '',
	include: [features.isPRList],
	load: features.onAjaxedPages,
	init,
});
