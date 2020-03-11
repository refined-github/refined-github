import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoGQL} from '../libs/utils';

const filterMergeCommits = async (commits: string[]): Promise<AnyObject> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			${commits.map((commit: string) => `
				${api.escapeKey(commit)}: object(expression: "${commit}") {
					... on Commit {
						associatedPullRequests(last: 1) {
							nodes {
								mergeCommit {
									oid
								}
								commits(last: 1) {
									nodes {
										commit {
											oid
										}
									}
								}
							}
						}
					}
				}
			`).join('\n')}
		}
    `);

	const lastCommits = {};
	for (const [key, commit] of Object.entries<AnyObject>(repository)) {
		const mergeCommit = (commit.associatedPullRequests.nodes[0].mergeCommit.oid as string);
		const lastCommit = commit.associatedPullRequests.nodes[0].commits.nodes[0].commit.oid;
		if (mergeCommit === key.slice(1)) {
			lastCommits[mergeCommit] = lastCommit;
		}
	}

	return lastCommits;
};

function getCommitHash(commit: HTMLElement): string {
	return (commit.nextElementSibling! as HTMLAnchorElement).href.split('/').slice(-1)[0];
}

async function init(): Promise<void | false> {
	const pullRequests = select.all('[data-hovercard-type="pull_request"]');
	const commits = await filterMergeCommits([...new Set(pullRequests.map(getCommitHash))]);

	for (const pullRequest of pullRequests) {
		const test = commits[getCommitHash(pullRequest)];
		const currentParentElement = pullRequest.closest('.blame-hunk');
		const versionsIcon = select('.blob-reblame',currentParentElement);
		const currentLineNumber = select('.js-line-number',currentParentElement)!.textContent;
		console.log(versionsIcon);
		console.log(currentLineNumber);
	}
}

features.add({
	id: __featureName__,
	description: 'Hello',
	screenshot: false,
	include: [
		features.isBlame
	],
	load: features.onAjaxedPages,
	init
});
