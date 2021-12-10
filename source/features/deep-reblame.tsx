import './deep-reblame.css';
import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {VersionsIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api.js';
import GitHubURL from '../github-helpers/github-url.js';
import LoadingIcon from '../github-helpers/icon-loading.js';
import looseParseInt from '../helpers/loose-parse-int.js';

const getPullRequestBlameCommit = mem(async (commit: string, prNumbers: number[], currentFilename: string): Promise<string> => {
	const {repository} = await api.v4(`
		repository() {
			file: object(expression: "${commit}:${currentFilename}") {
				id
			}
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

	if (!associatedPR || !prNumbers.includes(associatedPR.number) || associatedPR.mergeCommit.oid !== commit) {
		throw new Error('The PR linked in the title didn’t create this commit');
	}

	if (!repository.file) {
		throw new Error('The file was renamed and Refined GitHub can’t find it');
	}

	return associatedPR.commits.nodes[0].commit.oid;
});

async function redirectToBlameCommit(event: delegate.Event<MouseEvent, HTMLAnchorElement | HTMLButtonElement>): Promise<void> {
	const blameElement = event.delegateTarget;
	if (blameElement instanceof HTMLAnchorElement && !event.altKey) {
		return; // Unmodified click on regular link: let it proceed
	}

	event.preventDefault();
	blameElement.blur(); // Hide tooltip after click, it’s shown on :focus

	const blameHunk = blameElement.closest('.blame-hunk')!;
	const prNumbers = select.all('.issue-link', blameHunk).map(pr => looseParseInt(pr));
	const prCommit = select('a.message', blameHunk)!.pathname.split('/').pop()!;
	const blameUrl = new GitHubURL(location.href);

	const spinner = <LoadingIcon className="mr-2"/>;
	blameElement.firstElementChild!.replaceWith(spinner);

	try {
		blameUrl.branch = await getPullRequestBlameCommit(prCommit, prNumbers, blameUrl.filePath);
		blameUrl.hash = 'L' + select('.js-line-number', blameHunk)!.textContent!;
		location.href = blameUrl.href;
	} catch (error: unknown) {
		spinner.replaceWith(<VersionsIcon/>);
		alert((error as Error).message);
	}
}

function init(): void | false {
	const pullRequests = select.all('[data-hovercard-type="pull_request"]');
	if (pullRequests.length === 0) {
		return false;
	}

	delegate(document, '.rgh-deep-reblame', 'click', redirectToBlameCommit);
	for (const pullRequest of pullRequests) {
		const hunk = pullRequest.closest('.blame-hunk')!;

		const reblameLink = select('.reblame-link', hunk);
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
					<VersionsIcon/>
				</button>,
			);
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isBlame,
	],
	init,
});
