import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import TrashIcon from 'octicons-plain-react/Trash';

import features from '../feature-manager.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {userIsAdmin} from '../github-helpers/get-user-permission.js';

const tooltip = 'Open repository settings to delete this fork';

// Only if the repository hasn't been starred
async function isRepoUnpopular(): Promise<boolean> {
	const counter = await elementReady('.starring-container .Counter');
	return counter!.textContent === '0';
}

function addButton(header: HTMLElement): void {
	header.prepend(
		<li>
			<a
				href={buildRepoUrl('settings')}
				className="btn btn-sm btn-danger rgh-slow-repo-deletion"
				title={tooltip}
			>
				<TrashIcon className="mr-2" />
				Delete fork
			</a>
		</li>,
	);
}

async function initRepoRoot(signal: AbortSignal): Promise<void | false> {
	observe('.pagehead-actions', addButton, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isRepoRoot,
		pageDetect.isForkedRepo,
		userIsAdmin,
		isRepoUnpopular,
	],
	init: initRepoRoot,
});

/*

Test URLs:

1. Fork a repo, like https://github.com/left-pad/left-pad
2. Star it to see if the "Delete fork" button disappears
3. Click "Delete fork"
4. The repository settings page should open instead of immediate deletion

*/
