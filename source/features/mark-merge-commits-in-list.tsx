import './mark-merge-commits-in-list.css';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoGQL} from '../libs/utils';

const getMergeCommits = async (commits: string[]): Promise<string[]> => {
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

	return filterCommits(repository);
};

function filterCommits(commits: object): string[] {
	const mergeCommits = [];
	for (const commit of Object.entries(commits)) {
		if (commit[1].parents.totalCount === 2) {
			mergeCommits.push(commit[0]);
		}
	}

	return mergeCommits;
}

function getCommitHash(commit: HTMLElement): string {
	return (commit.dataset.channel as string).split(':')[3];
}

async function init(): Promise<void | false> {
	const pageCommits = select.all('li.commit');
	const parentCommitCount = await getMergeCommits(pageCommits.map(getCommitHash));
	for (const commit of pageCommits) {
		const commitHash = api.escapeKey(getCommitHash(commit));

		if (parentCommitCount.includes(commitHash)) {
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
