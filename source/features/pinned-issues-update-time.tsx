import React from 'dom-chef';
import select from 'select-dom';
import clockIcon from 'octicon/clock.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import { getRepoGQL } from '../libs/utils';

async function init(): Promise<void> {
	for (const pinnedIssue of select.all('.pinned-issue-item')) {
		const issueNumber = select('.opened-by', pinnedIssue)!.firstChild!.textContent!.replace(/\D/g, '');
		const lastUpdated = await getLastUpdated(issueNumber);
		const lastUpdatedTitle = new Intl.DateTimeFormat('default', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: 'numeric',
			timeZoneName: 'short'
		}).format(new Date(lastUpdated));

		pinnedIssue.lastElementChild!.append(
			<span className="d-md-inline issue-meta-section ml-2 text-gray text-small">
				{clockIcon()} updated <relative-time datetime={lastUpdated} title={lastUpdatedTitle} />
			</span>
		);
	}
}

const getLastUpdated = async (issue: string): Promise<string> => {
	const { repository } = await api.v4(`
		repository(${getRepoGQL()}) {
			issue (number:${issue}){
				updatedAt
			}
		}
	`);

	return repository.issue.updatedAt;
};

features.add({
	id: __featureName__,
	description: 'Adds the updated time to pinned issues.',
	screenshot: false,
	include: [
		features.isRepoIssueList
	],
	init
});
