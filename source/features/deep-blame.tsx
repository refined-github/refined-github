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
import loadingIcon from '../libs/icon-loading';

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

async function redirectToBlameCommit(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): Promise<void> {
	const blameLink = event.delegateTarget;
	if (blameLink.href) {
		if (event.altKey) {
			event.preventDefault();
		} else {
			return; // Unmodified click on regular link: let it proceed
		}
	}

	const blameHunk = blameLink.closest('.blame-hunk')!;
	const prNumber = looseParseInt(select('.issue-link', blameHunk)!.textContent!);
	const prCommit = select<HTMLAnchorElement>('a.message', blameHunk)!.href.split('/').pop()!;
	const spinner = loadingIcon();
	spinner.classList.add('mr-2');
	blameLink.firstElementChild!.replaceWith(spinner);
	// Hide tooltip after click, it’s shown on :focus
	blurAccessibly(blameLink);

	const prBlameCommit = await getPullRequestBlameCommit(prCommit, Number(prNumber));
	if (prBlameCommit) {
	 	const lineNumber = select('.js-line-number', blameHunk)!.textContent!;
		blameLink.pathname = location.pathname.replace(getReference()!, prBlameCommit);
		blameLink.hash = 'L' + lineNumber;
		blameLink.click();
		return;
	}

	// Restore the regular version link if there was one
	if (blameLink.href) {
		blameLink.setAttribute('aria-label', 'View blame prior to this change.');
		blameLink.classList.remove('rgh-deep-blame');
		spinner.replaceWith(versionIcon());
	} else {
		spinner.remove();
	}

	alert('The PR linked in the title didn’t create this commit');
}

function init(): void | false {
	const pullRequests = select.all('[data-hovercard-type="pull_request"]');
	if (pullRequests.length === 0) {
		return false;
	}

	for (const pullRequest of pullRequests) {
		const hunk = pullRequest.closest('.blame-hunk')!;

		const reblameLink = select('.reblame-link', hunk)!;
		if (reblameLink) {
			reblameLink.setAttribute('aria-label', 'View blame prior to this change. Hold Alt to extract commits from this PR first');
			reblameLink.classList.add('rgh-deep-blame');
		} else {
			select('.blob-reblame', hunk)!.append(
				<a
					aria-label="View blame prior to this change (extracts commits from this PR first)"
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
	description: 'When exploring blames, `alt`-clicking the "Reblame" buttons will extract the associated PR’s commits first, instead of treating the commit a single change.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/77025598-e9022000-6967-11ea-92dd-6f49875a225e.png',
	include: [
		features.isBlame
	],
	load: features.onAjaxedPages,
	init
});
