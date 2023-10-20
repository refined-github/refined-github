import './deep-reblame.css';
import mem from 'mem';
import React from 'dom-chef';
import {$, $$} from 'select-dom';
import {VersionsIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import showToast from '../github-helpers/toast.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import observe from '../helpers/selector-observer.js';
import GetPullRequestBlameCommit from './deep-reblame.gql';

const getPullRequestBlameCommit = mem(async (commit: string, prNumbers: number[], currentFilename: string): Promise<string> => {
	const {repository} = await api.v4(GetPullRequestBlameCommit, {
		variables: {
			commit,
			file: commit + ':' + currentFilename,
		},
	});

	const associatedPR = repository.object.associatedPullRequests.nodes[0];

	if (!associatedPR || !prNumbers.includes(associatedPR.number) || associatedPR.mergeCommit.oid !== commit) {
		throw new Error('The PR linked in the title didn’t create this commit');
	}

	if (!repository.file) {
		throw new Error('The file was renamed and Refined GitHub can’t find it');
	}

	return associatedPR.commits.nodes[0].commit.oid;
});

async function redirectToBlameCommit(event: DelegateEvent<MouseEvent, HTMLAnchorElement | HTMLButtonElement>): Promise<void> {
	const blameElement = event.delegateTarget;
	if (blameElement instanceof HTMLAnchorElement && !event.altKey) {
		return; // Unmodified click on regular link: let it proceed
	}

	event.preventDefault();
	blameElement.blur(); // Hide tooltip after click, it’s shown on :focus

	const blameHunk = blameElement.closest('.blame-hunk')!;
	const prNumbers = $$('.issue-link', blameHunk).map(pr => looseParseInt(pr));
	const prCommit = $('a.message', blameHunk)!.pathname.split('/').pop()!;
	const blameUrl = new GitHubFileURL(location.href);

	await showToast(async () => {
		blameUrl.branch = await getPullRequestBlameCommit(prCommit, prNumbers, blameUrl.filePath);
		blameUrl.hash = 'L' + $('.js-line-number', blameHunk)!.textContent;
		location.href = blameUrl.href;
	}, {
		message: 'Fetching pull request',
		doneMessage: 'Redirecting',
	});
}

function addButton(pullRequest: HTMLElement): void {
	const hunk = pullRequest.closest('.blame-hunk')!;

	const reblameLink = $('.reblame-link', hunk);
	if (reblameLink) {
		reblameLink.setAttribute('aria-label', 'View blame prior to this change. Hold `Alt` to extract commits from this PR first');
		reblameLink.classList.add('rgh-deep-reblame');
	} else {
		$('.blob-reblame', hunk)!.append(
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

function init(signal: AbortSignal): void {
	delegate('.rgh-deep-reblame', 'click', redirectToBlameCommit, {signal});
	observe('[data-hovercard-type="pull_request"]', addButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isBlame,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/blame/main/source/refined-github.ts

*/
