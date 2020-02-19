import React from 'dom-chef';
import select from 'select-dom';
import clockIcon from 'octicon/clock.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoGQL} from '../libs/utils';

async function init(): Promise<void> {
	const lastUpdated: any = await getLastUpdated(buildQuery(getPinnedIssueNumbers()));
	for (const pinnedIssue of select.all('.pinned-issue-item')) {
		const issueNumber = select('.opened-by', pinnedIssue)!.firstChild!.textContent!.replace(/\D/g, '');
		const {updatedAt} = lastUpdated[`_${issueNumber}_`];
		pinnedIssue.lastElementChild!.append(
			<span className="d-md-inline issue-meta-section ml-2 text-gray text-small">
				{clockIcon()} updated <relative-time datetime={updatedAt}/>
			</span>
		);
	}
}

const getLastUpdated = async (query: string): Promise<string[]> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			${query}
		}
	`);

	return repository;
};

function getPinnedIssueNumbers(): string[] {
	return select.all('.pinned-issue-item').map(pinnedIssue => {
		return select('.opened-by', pinnedIssue)!.firstChild!.textContent!.replace(/\D/g, '');
	});
}

function createQueryFragment(issue: string): string {
	return `
		_${issue}_:issue (number:${issue}){
			number,
			updatedAt
		}
	`;
}

function buildQuery(issueNumbers: string[]): string {
	return issueNumbers.map(createQueryFragment).join('\n');
}

features.add({
	id: __featureName__,
	description: 'Adds the updated time to pinned issues.',
	screenshot: false,
	include: [
		features.isRepoIssueList
	],
	init
});
