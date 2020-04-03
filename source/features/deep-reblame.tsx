import './deep-reblame.css';
import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import versionIcon from 'octicon/versions.svg';
import delegate, {DelegateEvent} from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';
import loadingIcon from '../libs/icon-loading';
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

	if (!associatedPR) {
		return false;
	}

	const mergeCommit = associatedPR.mergeCommit.oid;

	if (associatedPR.number === prNumber && mergeCommit === commit) {
		return associatedPR.commits.nodes[0].commit.oid;
	}

	return false;
});

async function redirectToBlameCommit(event: DelegateEvent<MouseEvent, HTMLAnchorElement | HTMLButtonElement>): Promise<void> {
	const blameElement = event.delegateTarget;
	if (blameElement instanceof HTMLAnchorElement) {
		if (event.altKey) {
			event.preventDefault();
		} else {
			return; // Unmodified click on regular link: let it proceed
		}
	}

	const blameHunk = blameElement.closest('.blame-hunk')!;
	const prNumber = looseParseInt(select('.issue-link', blameHunk)!.textContent!);
	const prCommit = select<HTMLAnchorElement>('a.message', blameHunk)!.href.split('/').pop()!;
	const spinner = loadingIcon();
	spinner.classList.add('mr-2');
	blameElement.firstElementChild!.replaceWith(spinner);

	blameElement.blur(); // Hide tooltip after click, it’s shown on :focus

	const prBlameCommit = await getPullRequestBlameCommit(prCommit, prNumber);
	if (prBlameCommit) {
		const lineNumber = select('.js-line-number', blameHunk)!.textContent!;
		const href = new URL(location.href.replace(getReference()!, prBlameCommit));
		href.hash = 'L' + lineNumber;
		location.href = String(href);
		return;
	}

	if (blameElement instanceof HTMLAnchorElement) {
		// Restore the regular version link if there was one
		blameElement.setAttribute('aria-label', 'View blame prior to this change.');
		blameElement.classList.remove('rgh-deep-blame');
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
			reblameLink.setAttribute('aria-label', 'View blame prior to this change. Hold `Alt` to extract commits from this PR first');
			reblameLink.classList.add('rgh-deep-reblame');
		} else {
			select('.blob-reblame', hunk)!.append(
				<button
					type="button"
					aria-label="View blame prior to this change (extracts commits from this PR first)"
					className="reblame-link btn-link no-underline tooltipped tooltipped-e d-inline-block pr-1 rgh-deep-reblame"
				>
					{versionIcon()}
				</button>
			);
		}
	}

	delegate('.rgh-deep-reblame', 'click', redirectToBlameCommit);
}

features.add({
	id: __featureName__,
	description: 'When exploring blames, `Alt`-clicking the “Reblame” buttons will extract the associated PR’s commits first, instead of treating the commit a single change.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/77248541-8e3f2180-6c10-11ea-91d4-221ccc0ecebb.png'
}, {
	include: [
		features.isBlame
	],
	load: features.onAjaxedPages,
	init
});
