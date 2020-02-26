import './mark-merge-commits-in-list.css';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoGQL} from '../libs/utils';

interface IssueInfo {
	parents: any;
	totalCount: any;
}

const getCommitParentCount = async (commits: string[]): Promise<Record<string, IssueInfo>> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			${commits.map((commit: string) => `
				${api.escapeKey(commit)}: object(expression: "${commit}") {
					... on Commit {
							parents{
								totalCount
							}
						}
					}
			`).join('\n')}
		}
	`);

	return repository;
};

function getCommitHash(commit: any): any {
	return commit.dataset.channel.split(':')[3];
}

async function init(): Promise<void | false> {
	const pageCommits = select.all('li.commit');
	const parentCommitCount = await getCommitParentCount(pageCommits.map(getCommitHash));
	for (const commit of pageCommits) {
		const commitHash = getCommitHash(commit);
		const {totalCount} = parentCommitCount[api.escapeKey(commitHash)].parents;
		if (totalCount === 2) {
			commit.classList.add('refined-github-merge-commit');
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Dims merge commits in commits list.',
	screenshot: false,
	include: [
		features.isCommitList
	],
	load: features.onAjaxedPages,
	init
});
