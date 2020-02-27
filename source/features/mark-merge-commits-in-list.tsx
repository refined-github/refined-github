import './mark-merge-commits-in-list.css';
import select from 'select-dom';
import gitPullRequest from 'octicon/git-pull-request.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoGQL} from '../libs/utils';

const filterMergeCommits = async (commits: string[]): Promise<string[]> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			${commits.map((commit: string) => `
				${api.escapeKey(commit)}: object(expression: "${commit}") {
				... on Commit {
						parents {
							totalCount
						}
					}
				}
			`).join('\n')}
		}
	`);

	const mergeCommits = [];
	// @ts-ignore
	for (const [commit, {parents}] of Object.entries(repository)) {
		if (parents.totalCount === 2) {
			mergeCommits.push(commit.slice(1));
		}
	}

	return mergeCommits;
};

function getCommitHash(commit: HTMLElement): string {
	return (commit.dataset.channel as string).split(':')[3];
}

async function init(): Promise<void | false> {
	const pageCommits = select.all('li.commit');
	const mergeCommits = await filterMergeCommits(pageCommits.map(getCommitHash));
	for (const commit of pageCommits) {
		if (mergeCommits.includes(getCommitHash(commit))) {
			commit.classList.add('rgh-merge-commit');
			select('.commit-title', commit)!.prepend(gitPullRequest());
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
