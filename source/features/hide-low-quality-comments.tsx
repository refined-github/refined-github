import './hide-low-quality-comments.css';

import * as pageDetect from 'github-url-detection';
import {$, closestElement, closestElementOptional, elementExists} from 'select-dom';
import {mount, unmount} from 'svelte';

import lowQualityCount from '../components/hide-low-quality-comments-store.js';
import features from '../feature-manager.js';
import isLowQualityComment from '../helpers/is-low-quality-comment.js';
import observe from '../helpers/selector-observer.js';
import singleton from '../helpers/singleton.js';
import HideLowQualityComments from './hide-low-quality-comments.svelte';

async function unhide(): Promise<void> {
	$('#issue-timeline').classList.add('rgh-unhide-low-quality-comments');
	$('.rgh-low-quality-comment').scrollIntoView();
}

function hideComment(comment: HTMLElement): void {
	lowQualityCount.update(n => n + 1);
	comment.classList.add('rgh-low-quality-comment');
}

function closestComment(element: HTMLElement): HTMLElement {
	return closestElement('[data-wrapper-timeline-id]', element);
}

// Exclude explicitly linked comments #5363
function isDeepLinked(comment: HTMLElement): boolean {
	return location.hash.startsWith('#issuecomment-') && Boolean(closestElementOptional(location.hash, comment));
}

function maybeHide(commentText: HTMLElement): void {
	if (isDeepLinked(commentText) || !isLowQualityComment(commentText.textContent)) {
		return;
	}

	// Comments that contain useful images or links shouldn't be removed.
	// Images are wrapped in <a> tags on GitHub hence included in the selector
	if (elementExists('a', commentText)) {
		return;
	}

	// Ensure that they're not by VIPs (owner, collaborators, etc)
	const comment = closestComment(commentText);
	if (elementExists('[data-component="Label"]', comment)) {
		return;
	}

	// If the person is having a conversation, then don't hide it
	const author = $('a[data-testid="avatar-link"]', comment).getAttribute('href')!;
	// If the first comment left by the author isn't a low quality comment (previously hidden or about to be hidden), then leave this one as well
	const previousComment = $(
		`[data-wrapper-timeline-id]:not(.rgh-low-quality-comment) a[data-testid="avatar-link"][href="${author}"]:not(.color-fg-muted)`,
	);
	if (closestComment(previousComment) !== comment) {
		return;
	}

	hideComment(comment);
}

function addWidget(target: HTMLElement): () => void {
	const app = mount(HideLowQualityComments, {target, anchor: target.firstChild!, props: {onclick: unhide}});
	return () => {
		void unmount(app);
	};
}

function init(signal: AbortSignal): void {
	lowQualityCount.set(0);
	observe('#react-issue-comment-composer', singleton(addWidget), {signal});
	observe('.markdown-body > p:only-child', maybeHide, {signal});
}

// This should NOT be made dynamic via observer, it's not worth updating the lowQuality count for fresh comments
void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
	],
	awaitDomReady: true,
	init,
});

/*

## Test URLs

- +1 and repeated comments: https://github.com/refined-github/sandbox/issues/168
- 26 hidden comments: https://togithub.com/stephencookdev/speed-measure-webpack-plugin/issues/167#issue-849740710
- Linked comment should not be collapsed: https://togithub.com/stephencookdev/speed-measure-webpack-plugin/issues/167#issuecomment-821212185

*/
