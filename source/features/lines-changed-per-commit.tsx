import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoGQL} from '../libs/utils';
import React from 'dom-chef';

const getCommitChanges = async (commits: string[]): Promise<string[]> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			${commits.map((commit: string) => `
				${api.escapeKey(commit)}: object(expression: "${commit}") {
				... on Commit {
                    additions
                    deletions
					}
				}
			`).join('\n')}
		}
	`);

	return repository;
};

function getCommitHash(commit: HTMLElement): string {
	return (commit.dataset.channel as string).split(':')[3];
}

async function init(): Promise<void | false> {
	const pageCommits = select.all('li.commit:not(.rgh-merge-commit)');
	const commitChanges = await getCommitChanges(pageCommits.map(getCommitHash));
	for (const commit of pageCommits) {
		// @ts-ignore
		const {additions, deletions} = commitChanges[api.escapeKey(getCommitHash(commit))];
		const totalLinesChanged = `${Number(additions) + Number(deletions)} Lines Changed`;
		(select('.commit-indicator', commit)! ?? select('relative-time', commit)).append(
			<span className="ml-2 diffstat tooltipped tooltipped-s" aria-label={totalLinesChanged}>
				<span className="text-green">+{additions}</span>
				<span className="ml-1 mr-2 text-red">−{deletions}</span>

			</span>);
	}
}

features.add({
	id: __featureName__,
	description: 'Add line changes per commit',
	screenshot: 'https://user-images.githubusercontent.com/16872793/75835025-cb3f9300-5d8b-11ea-8126-d8778c71e467.png',
	include: [
		features.isCommitList
	],
	load: features.onAjaxedPages,
	init
});
