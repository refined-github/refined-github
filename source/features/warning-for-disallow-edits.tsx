import './warning-for-disallow-edits.css';

import React from 'dom-chef';
import {$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import attachElement from '../helpers/attach-element.js';

const getWarning = (): React.JSX.Element => (
	<div className="flash flex-auto flash-error mt-3 mb-3 rgh-warning-for-disallow-edits">
		<strong>Note:</strong> Maintainers may require changes. It&apos;s easier and faster to allow them to make direct changes before merging.
	</div>
);

function init(): void | false {
	const checkbox = $optional('input[name="collab_privs"]');
	if (!checkbox) {
		return false;
	}

	if (pageDetect.isPRConversation()) {
		attachElement(
			checkbox.closest('.discussion-sidebar-item')!,
			{after: getWarning},
		);
	} else {
		const option = checkbox.closest('.js-collab-option')!;

		// Prevent layout shifting when warning appears
		option.classList.remove('flex-auto');
		const actionRow = option.parentElement!;
		actionRow.classList.add('mt-1');
		actionRow.parentElement!.classList.remove('flex-wrap');

		attachElement(
			actionRow.lastElementChild!,
			{after: getWarning},
		);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isMergedPR,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

1. Open https://github.com/pulls?q=+is%3Apr+is%3Aopen+author%3A%40me+archived%3Afalse+-user%3A%40me+
2. Open any PR opened from a fork
3. Toggle the checkbox in the sidebar

*/
