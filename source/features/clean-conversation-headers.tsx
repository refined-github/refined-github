import React from 'dom-chef';
import './clean-conversation-headers.css';
import select from 'select-dom';
import {observe} from 'selector-observer';
import {ArrowLeftIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getCurrentBranch} from '../github-helpers';

const deinit: VoidFunction[] = [];

function initIssue(): void {
	const observer = observe('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-header)', {
		add(byline) {
			byline.classList.add('rgh-clean-conversation-header');
			const {childNodes: bylineNodes} = byline;
			// Removes: octocat opened this issue on 1 Jan [·] 1 comments
			bylineNodes[4].textContent = bylineNodes[4].textContent!.replace('·', '');

			// Removes: [octocat opened this issue on 1 Jan] · 1 comments
			for (const node of [...bylineNodes].slice(0, 4)) {
				node.remove();
			}
		}
	});
	deinit.push(observer.abort);
}

function initPR(): void {
	const observer = observe('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-header)', {
		async add(byline) {
			byline.classList.add('rgh-clean-conversation-header');
			const isSameAuthor = select('.TimelineItem:first-child .author')?.textContent === select('.author', byline)!.textContent;
			const baseBranch = select('.commit-ref:not(.head-ref)', byline)!;
			const isDefaultBranch = getCurrentBranch() === await getDefaultBranch();

			byline.childNodes[pageDetect.isClosedPR() ? (pageDetect.isMergedPR() ? 5 : 7) : 9].replaceWith(<> <ArrowLeftIcon/> </>);

			// Removes: [octocat wants to merge 1 commit into] github:master from octocat:feature
			// Removes: [octocat merged 1 commit into] master from feature
			for (const node of [...byline.childNodes].slice(isSameAuthor ? 0 : 2, pageDetect.isMergedPR() ? 3 : 5)) {
				node.remove();
			}

			if (!isSameAuthor) {
				byline.prepend('by ');

				if (pageDetect.isMergedPR()) {
					baseBranch.before(' · ');
				}
			}

			if (!isDefaultBranch && !(pageDetect.isClosedPR() && baseBranch.title.endsWith(':master'))) {
				baseBranch.classList.add('rgh-clean-conversation-headers-non-default-branch');
			}
		}
	});
	deinit.push(observer.abort);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isIssue
	],
	awaitDomReady: false,
	init: initIssue,
	deinit
}, {
	include: [
		pageDetect.isPR
	],
	awaitDomReady: false,
	init: initPR,
	deinit
});
