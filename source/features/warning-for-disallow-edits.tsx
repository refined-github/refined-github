import './warning-for-disallow-edits.css';

import React from 'dom-chef';
import {$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import attachElement from '../helpers/attach-element.js';

const getWarning = (): React.JSX.Element => (
	<div className="flash flash-error mt-3 rgh-warning-for-disallow-edits">
		<strong>Note:</strong> Maintainers may require changes. It&apos;s easier and faster to allow them to make direct changes before merging.
	</div>
);

function init(): void | false {
	const checkbox = $optional('input[name="collab_privs"]');
	if (!checkbox) {
		return false;
	}

	attachElement(
		checkbox.closest('form')!,
		{after: getWarning},
	);
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
