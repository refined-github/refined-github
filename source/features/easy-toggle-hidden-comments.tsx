import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import {wasInteractiveElementClicked} from './easy-toggle-commit-messages.js';

function toggle(event: DelegateEvent<MouseEvent>): void {
	if (!wasInteractiveElementClicked(event)) {
		$(
			[
				'.review-thread-chevron', // PRs
				'button:has(> .octicon-unfold, > .octicon-fold)', // Issues
			],
			event.delegateTarget,
		).click();
	}
}

function init(signal: AbortSignal): void {
	delegate(
		[
			'.js-toggle-outdated-comments', // PRs
			'div[data-testid="comment-header"]:has(.octicon-unfold, .octicon-fold)', // Issues
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

Test URLs:

- Resolved PR review: https://github.com/refined-github/sandbox/pull/47#pullrequestreview-4175514676

- Hidden issue comment: https://github.com/refined-github/sandbox/issues/131#issuecomment-4297544223

*/
