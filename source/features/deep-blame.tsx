import './deep-blame.css';
import blurAccessibly from 'blur-accessibly';
import cache from 'webext-storage-cache';
import delegate, {DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import versionIcon from 'octicon/versions.svg';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoGQL, getReference} from '../libs/utils';

const getPullRequestBlameCommit = cache.function(async (commit: string, prNumber: number): Promise<string | false> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			object(expression: "${commit}") {
				... on Commit {
					associatedPullRequests(last: 1) {
						nodes {
							number
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

	const {nodes} = repository.object.associatedPullRequests;
	const mergeCommit = nodes[0].mergeCommit.oid;
	const pullRequestNumber = nodes[0].number;

	if (pullRequestNumber === prNumber && mergeCommit === commit) {
		return nodes[0].commits.nodes[0].commit.oid;
	}

	return false;
}, {
	cacheKey: ([commit]) => __featureName__ + commit
});

function getCommitHash(commit: HTMLElement): string {
	return (commit.nextElementSibling! as HTMLAnchorElement).href.split('/').slice(-1)[0];
}

const githubSpinner = (
	<img
		src="https://github.githubassets.com/images/spinners/octocat-spinner-128.gif"
		alt="Octocat Spinner Icon"
		className="mr-2"
		width="18"
	/>
);

async function redirectToBlameCommit(event: DelegateEvent<MouseEvent, HTMLLinkElement>): Promise<void | false> {
	const blameLink = event.delegateTarget;
	const {lineNumber, commit: pullRequestCommit, prNumber} = blameLink.dataset;
	if (blameLink.href && event.altKey) {
		event.preventDefault();
	}

	blameLink.firstElementChild!.replaceWith(githubSpinner);
	// Hide tooltip after click, it’s shown on :focus
	blurAccessibly(blameLink);

	const prBlameCommit = await getPullRequestBlameCommit(pullRequestCommit!, Number(prNumber));
	if (!prBlameCommit) {
		// Restore the regular version link if there was one
		if (blameLink.href) {
			blameLink.setAttribute('aria-label', 'View blame prior to this change.');
			blameLink.classList.remove('rgh-deep-blame');
			blameLink.firstElementChild!.replaceWith(versionIcon());
		} else {
			blameLink.firstElementChild!.remove();
		}

		alert('Unable to find linked Pull Request');
		return;
	}

	const href = new URL(location.href.replace(getReference()!, prBlameCommit));
	href.hash = 'L' + lineNumber!;
	location.href = String(href);
}

async function init(): Promise<void | false> {
	const pullRequests = select.all('[data-hovercard-type="pull_request"]');
	if (pullRequests.length === 0) {
		return false;
	}

	for (const pullRequest of pullRequests) {
		const currentParentElement = pullRequest.closest('.blame-hunk')!;
		const versionsParent = select('.blob-reblame', currentParentElement);
		const currentLineNumber = select('.js-line-number', currentParentElement)!.textContent!;
		const prNumber = select('.issue-link', currentParentElement)!.textContent!.replace('#', '');
		const commitHash = getCommitHash(pullRequest);

		if (select.exists('a', versionsParent!)) {
			const versionsElement = select('a', versionsParent!)!;
			versionsElement.setAttribute('aria-label', 'View blame prior to this change. Press Alt to view the `deep-blame`');
			versionsElement.classList.add('rgh-deep-blame');
			versionsElement.dataset.commit = commitHash;
			versionsElement.dataset.lineNumber = currentLineNumber;
			versionsElement.dataset.prNumber = prNumber;
		} else {
			versionsParent!.append(
				<a
					data-commit={commitHash}
					data-line-number={currentLineNumber}
					data-pr-number={prNumber}
					aria-label="View `deep-blame` prior to this change"
					className="reblame-link link-hover-blue no-underline tooltipped tooltipped-e d-inline-block pr-1 rgh-deep-blame"
				> {versionIcon()}
				</a>
			);
		}
	}

	delegate('.rgh-deep-blame', 'click', redirectToBlameCommit);
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
