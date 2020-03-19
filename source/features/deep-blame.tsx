import './deep-blame.css';
import blurAccessibly from 'blur-accessibly';
import delegate, {DelegateEvent} from 'delegate-it';
import mem from 'mem';
import React from 'dom-chef';
import versionIcon from 'octicon/versions.svg';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoGQL, getReference, looseParseInt} from '../libs/utils';

const getPullRequestBlameCommit = mem(async (commit: string, prNumber: number): Promise<string | false> => {
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

	const associatedPR = repository.object.associatedPullRequests.nodes[0];
	const mergeCommit = associatedPR.mergeCommit.oid;

	if (associatedPR.number === prNumber && mergeCommit === commit) {
		return associatedPR.commits.nodes[0].commit.oid;
	}

	return false;
});

function getCommitHash(commit: HTMLLinkElement): string {
	return commit.href.split('/').pop()!;
}

async function redirectToBlameCommit(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): Promise<void> {
	const blameLink = event.delegateTarget;
	const currentParentElement = blameLink.closest('.blame-hunk')!;
	const lineNumber = select('.js-line-number', currentParentElement)!.textContent!;
	const prNumber = looseParseInt(select('.issue-link', currentParentElement)!.textContent!);
	const pullRequestCommit = getCommitHash(select<HTMLLinkElement>('a.message', currentParentElement)!);
	if (blameLink.href && event.altKey) {
		event.preventDefault();
	}

	const githubSpinner = (
		<img
			src="https://github.githubassets.com/images/spinners/octocat-spinner-128.gif"
			className="mr-2"
			width="18"
		/>
	);

	blameLink.firstElementChild!.replaceWith(githubSpinner);
	// Hide tooltip after click, it’s shown on :focus
	blurAccessibly(blameLink);

	const prBlameCommit = await getPullRequestBlameCommit(pullRequestCommit, Number(prNumber));
	if (!prBlameCommit) {
		// Restore the regular version link if there was one
		if (blameLink.href) {
			blameLink.setAttribute('aria-label', 'View blame prior to this change.');
			blameLink.classList.remove('rgh-deep-blame');
			blameLink.firstElementChild!.replaceWith(versionIcon());
		} else {
			blameLink.firstElementChild!.remove();
		}

		alert('Unable to find linked Pull Request.');

		return;
	}

	const href = new URL(location.href.replace(getReference()!, prBlameCommit));
	href.hash = 'L' + lineNumber;
	location.href = String(href);
}

function init(): void|false {
	const pullRequests = select.all('[data-hovercard-type="pull_request"]');
	if (pullRequests.length === 0) {
		return false;
	}

	for (const pullRequest of pullRequests) {
		const currentParentElement = pullRequest.closest('.blame-hunk')!;
		const versionsParent = select('.blob-reblame', currentParentElement);

		if (select.exists('a', versionsParent!)) {
			const versionsElement = select('a', versionsParent!)!;
			versionsElement.setAttribute('aria-label', 'View blame prior to this change. Press Alt to view the `deep-blame`');
			versionsElement.classList.add('rgh-deep-blame');
		} else {
			versionsParent!.append(
				<a
					aria-label="View `deep-blame` prior to this change"
					className="reblame-link link-hover-blue no-underline tooltipped tooltipped-e d-inline-block pr-1 rgh-deep-blame"
				>
					{versionIcon()}
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
