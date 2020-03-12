import './deep-blame.css';
import select from 'select-dom';
import * as api from '../libs/api';
import elementReady from 'element-ready';
import React from 'dom-chef';
import features from '../libs/features';
import {getRepoGQL, getReference} from '../libs/utils';
import versionIcon from 'octicon/versions.svg';

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

	const lastCommits = new Map();
	for (const [key, commit] of Object.entries<AnyObject>(repository)) {
		const {nodes} = commit.associatedPullRequests;
		const mergeCommit = nodes[0].mergeCommit.oid;
		const lastCommit = nodes[0].commits.nodes[0].commit.oid;
		if (mergeCommit === key.slice(1)) {
			lastCommits.set(mergeCommit, lastCommit);
		}
	}

	return lastCommits;
};

async function getDeepBlame(): Promise<void | false> {
	const pullRequests = select.all('[data-hovercard-type="pull_request"]');
	const commits = await filterMergeCommits([...new Set(pullRequests.map(getCommitHash))]);

	for (const pullRequest of pullRequests) {
		const prBlameCommit = commits.get(getCommitHash(pullRequest));
		// If a pull request number was associated with a random commit.
		if (!prBlameCommit) {
			return;
		}

		const currentParentElement = pullRequest.closest('.blame-hunk');
		const versionsParent = select('.blob-reblame', currentParentElement!);
		const currentLineNumber = select('.js-line-number', currentParentElement!)!.textContent!;

		const href = new URL(window.location.href.replace(String(getReference()), prBlameCommit));
		href.hash = 'L' + currentLineNumber;

		if (select.exists('a', versionsParent!)) {
			const versionsElement = select('a', versionsParent!);
			versionsElement!.setAttribute('aria-label', 'View blame prior to this change. Press Alt to view the `deep-blame`');
			versionsElement!.classList.add('rgh-deeper-blame');
			versionsElement!.addEventListener('click', event => {
				if (event.altKey) {
					event.preventDefault();
					location.href = String(href);
				}
			});
		} else {
			versionsParent!.append(
				<a
					href={String(href)}
					aria-label="View `deep-blame` prior to this change"
					className="reblame-link link-hover-blue no-underline tooltipped tooltipped-e d-inline-block pr-1 rgh-deep-blame"
				> {versionIcon()}
				</a>
			);
		}
	}

	select('.rgh-deep-blame-button')!.remove();
}

function getCommitHash(commit: HTMLElement): string {
	return (commit.nextElementSibling! as HTMLAnchorElement).href.split('/').slice(-1)[0];
}

async function init(): Promise<void | false> {
	const buttonGroup = await elementReady('.file-actions .BtnGroup');
	if (!select.exists('[data-hovercard-type="pull_request"]')) {
		return;
	}

	buttonGroup!.append(
		<a
			className="btn btn-sm BtnGroup-item tooltipped tooltipped tooltipped-n rgh-md-source rgh-deep-blame-button"
			type="button"
			aria-label="Get the deep blame"
			onClick={getDeepBlame}
		>
			{versionIcon()}
		</a>
	);
}

features.add({
	id: __featureName__,
	description: 'Add Deep Blame to commits',
	screenshot: false,
	include: [
		features.isBlame
	],
	load: features.nowAndOnAjaxedPages,
	init
});
