import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$, closestElementOptional} from 'select-dom';

import features from '../feature-manager.js';
import {interactiveElementSelector} from './easy-toggle-commit-messages.js';

function toggle(event: DelegateEvent<MouseEvent>): void {
	const elementClicked = event.target as HTMLElement;
	if (closestElementOptional(interactiveElementSelector, elementClicked)) {
		return;
	}

	const button = $(
		[
			'.review-thread-chevron',
			'button:has(> .octicon-unfold, > .octicon-fold)',
		],
		event.delegateTarget,
	);
	button.click();
}

function init(signal: AbortSignal): void {
	delegate(
		[
			'div[data-testid="comment-header"]:has(.octicon-unfold, .octicon-fold)',
			'.js-toggle-outdated-comments',
		],
		'click',
		toggle,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	init,
});

/*
Test URLs

https://github.com/refined-github/sandbox/issues/131#issuecomment-4297544223

https://github.com/refined-github/sandbox/pull/47#pullrequestreview-4175514676

*/
