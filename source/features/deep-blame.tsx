import './deep-blame.css';
import select from 'select-dom';
import * as api from '../libs/api';
import React from 'dom-chef';
import features from '../libs/features';
import {getRepoGQL, getReference} from '../libs/utils';
import delegate from 'delegate-it';
import versionIcon from 'octicon/versions.svg';

const filterMergeCommits = async (commit: string): Promise<AnyObject | undefined> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
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
		}
	`);

	const {nodes} = repository[api.escapeKey(commit)].associatedPullRequests;
	const mergeCommit = nodes[0].mergeCommit.oid;

	if (mergeCommit === commit) {
		return nodes[0].commits.nodes[0].commit.oid;
	}

	return undefined;
};

function getCommitHash(commit: HTMLElement): string {
	return (commit.nextElementSibling! as HTMLAnchorElement).href.split('/').slice(-1)[0];
}

async function getDeepBlame(event): Promise<void | false> {
	const currentParentElement = event.target.closest('.blame-hunk');
	const currentLineNumber = select('.js-line-number', currentParentElement)!.textContent!;
	const pullRequestCommit = event.target.parentElement.dataset.commit;
	const prBlameCommit = await filterMergeCommits(pullRequestCommit);

	const href = new URL(window.location.href.replace(String(getReference()), prBlameCommit));
	href.hash = 'L' + currentLineNumber;
	location.href = String(href);
}

async function init(): Promise<void | false> {
	const pullRequests = select.all('[data-hovercard-type="pull_request"]');
	if (pullRequests.length === 0) {
		return;
	}

	for (const pullRequest of pullRequests) {
		// If a pull request number was associated with a random commit.

		const currentParentElement = pullRequest.closest('.blame-hunk');
		const versionsParent = select('.blob-reblame', currentParentElement!);

		if (select.exists('a', versionsParent!)) {
			const versionsElement = select('a', versionsParent!);
			versionsElement!.setAttribute('aria-label', 'View blame prior to this change. Press Alt to view the `deep-blame`');
			versionsElement!.classList.add('rgh-deeper-blame');
			versionsElement!.addEventListener('click', event => {
				if (event.altKey) {
					event.preventDefault();
					location.href = String('');
				}
			});
		} else {
			versionsParent!.append(
				<a
					data-commit={getCommitHash(pullRequest)}
					aria-label="View `deep-blame` prior to this change"
					className="reblame-link link-hover-blue no-underline tooltipped tooltipped-e d-inline-block pr-1 rgh-deep-blame"
				> {versionIcon()}
				</a>
			);
		}
	}

	delegate('.rgh-deep-blame', 'click', getDeepBlame);
}

features.add({
	id: __featureName__,
	description: 'Add Deep Blame to commits',
	screenshot: false,
	include: [
		features.isBlame
	],
	load: features.onAjaxedPages,
	init
});
