/**
@description Warns you when unchecking <code>Allow edits from maintainers</code>, as it’s maintainer-hostile.
@screenshot https://user-images.githubusercontent.com/1402241/53151888-24101380-35ef-11e9-8d30-d6315ad97325.gif
*/

import './warning-for-disallow-edits.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$optional, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import attachElement from '../helpers/attach-element.js';

const getWarning = (): React.JSX.Element => (
	<div className="flash flex-auto flash-error my-3 tmp-my-3 rgh-warning-for-disallow-edits">
		<strong>Note:</strong>{' '}
		Maintainers may require changes. It&apos;s easier and faster to allow them to make direct changes before merging.
	</div>
);

function init(): void | false {
	const checkbox = $optional('input[name="collab_privs"]');
	if (!checkbox) {
		return false;
	}

	if (pageDetect.isPRConversation()) {
		attachElement(
			closestElement('.discussion-sidebar-item', checkbox),
			{after: getWarning},
		);
	} else {
		const option = closestElement('.js-collab-option', checkbox);

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
