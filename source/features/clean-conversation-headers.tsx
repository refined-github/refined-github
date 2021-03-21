import './clean-conversation-headers.css';
import select from 'select-dom';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

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
		add(byline) {
			byline.classList.add('rgh-clean-conversation-header');
			const isSameAuthor = select('.js-discussion > .TimelineItem:first-child .author')?.textContent === select('.author', byline)!.textContent;
			const baseBranch = select('.commit-ref:not(.head-ref)', byline)!;
			const isDefaultBranch = (baseBranch.firstElementChild as HTMLAnchorElement).pathname.split('/').length === 3;

			// Removes: [octocat wants to merge 1] commit into github:master from octocat:feature
			// Removes: [octocat] merged 1 commit into master from feature
			for (const node of [...byline.childNodes].slice(isSameAuthor ? 0 : 2, pageDetect.isMergedPR() ? 2 : 4)) {
				node.remove();
			}

			baseBranch.previousSibling!.textContent = ' into ';
			if (!isSameAuthor) {
				byline.prepend('by ');
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
