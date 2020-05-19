import './deep-reblame.css';
import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import VersionIcon from 'octicon/versions.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import parseRoute from '../github-helpers/parse-route';
import LoadingIcon from '../github-helpers/icon-loading';
import {getRepoGQL, looseParseInt} from '../github-helpers';

const getPullRequestBlameCommit = mem(async (commit: string, prNumber: number, currentFilename: string): Promise<string> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			file: object(expression: "${commit}:${currentFilename}") {
				... on Blob {
					id
				}
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

	if (!associatedPR || associatedPR.number !== prNumber || associatedPR.mergeCommit.oid !== commit) {
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
	const prNumber = looseParseInt(select('.issue-link', blameHunk)!.textContent!);
	const prCommit = select<HTMLAnchorElement>('a.message', blameHunk)!.pathname.split('/').pop()!;
	const path = parseRoute(location.pathname);
	const {filePath: currentFilename} = path;

	const spinner = <LoadingIcon className="mr-2"/>;
	blameElement.firstElementChild!.replaceWith(spinner);

	try {
		const prBlameCommit = await getPullRequestBlameCommit(prCommit, prNumber, currentFilename);
		const lineNumber = select('.js-line-number', blameHunk)!.textContent!;
		path.branch = prBlameCommit;
		const href = new URL(path.toString(), location.origin);
		href.hash = 'L' + lineNumber;
		location.href = String(href);
	} catch (error) {
		spinner.replaceWith(<VersionIcon/>);
		alert(error.message);
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
					<VersionIcon/>
				</button>
			);
		}
	}
}

features.add({
	id: __filebasename,
	description: 'When exploring blames, `Alt`-clicking the “Reblame” buttons will extract the associated PR’s commits first, instead of treating the commit a single change.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/77248541-8e3f2180-6c10-11ea-91d4-221ccc0ecebb.png'
}, {
	include: [
		pageDetect.isBlame
	],
	init
});
