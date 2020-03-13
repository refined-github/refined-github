import './deep-blame.css';
import select from 'select-dom';
import * as api from '../libs/api';
import cache from 'webext-storage-cache';
import React from 'dom-chef';
import features from '../libs/features';
import {getRepoGQL, getReference} from '../libs/utils';
import delegate, {DelegateEvent} from 'delegate-it';
import versionIcon from 'octicon/versions.svg';
import octofaceIcon from 'octicon/octoface.svg';

const getPullRequestBlameCommit = cache.function(async (commit: string): Promise<string | false> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			object(expression: "${commit}") {
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

	const {nodes} = repository.object.associatedPullRequests;
	const mergeCommit = nodes[0].mergeCommit.oid;

	if (mergeCommit === commit) {
		return nodes[0].commits.nodes[0].commit.oid;
	}

	return false;
}, {
	cacheKey: ([commit]) => __featureName__ + commit
});

function getCommitHash(commit: HTMLElement): string {
	return (commit.nextElementSibling! as HTMLAnchorElement).href.split('/').slice(-1)[0];
}

async function redirectToBlameCommit(event: DelegateEvent<MouseEvent, HTMLLinkElement>): Promise<void | false> {
	const {lineNumber, commit: pullRequestCommit} = event.delegateTarget.dataset;
	if (event.delegateTarget.href && event.altKey) {
		event.preventDefault();
	}

	event.delegateTarget.classList.add('anim-pulse');
	event.delegateTarget.replaceChild(octofaceIcon(), event.delegateTarget.firstElementChild!);

	const prBlameCommit = await getPullRequestBlameCommit(String(pullRequestCommit));
	if (!prBlameCommit) {
		event.delegateTarget.removeChild(event.delegateTarget.firstElementChild!);
		return;
	}

	const href = new URL(window.location.href.replace(String(getReference()), prBlameCommit));
	href.hash = 'L' + String(lineNumber);
	location.href = String(href);
}

async function init(): Promise<void | false> {
	const pullRequests = select.all('[data-hovercard-type="pull_request"]');
	if (pullRequests.length === 0) {
		return;
	}

	for (const pullRequest of pullRequests) {
		const currentParentElement = pullRequest.closest('.blame-hunk')!;
		const versionsParent = select('.blob-reblame', currentParentElement);
		const currentLineNumber = select('.js-line-number', currentParentElement)!.textContent!;

		if (select.exists('a', versionsParent!)) {
			const versionsElement = select('a', versionsParent!)!;
			versionsElement.setAttribute('aria-label', 'View blame prior to this change. Press Alt to view the `deep-blame`');
			versionsElement.classList.add('rgh-deep-blame');
			versionsElement.dataset.commit = getCommitHash(pullRequest);
			versionsElement.dataset.lineNumber = currentLineNumber;
		} else {
			versionsParent!.append(
				<a
					data-commit={getCommitHash(pullRequest)}
					data-line-number={currentLineNumber}
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
