import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import copyToClipboard from 'copy-text-to-clipboard';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

const handler = ({key, target}: KeyboardEvent): void => {
	if (key === 'y' && !isEditable(target)) {
		const permalink = select('a.js-permalink-shortcut')!.href;
		copyToClipboard(permalink + location.hash);
	}
};

function init(): void {
	window.addEventListener('keyup', handler);
}

function deinit(): void {
	window.removeEventListener('keyup', handler);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isBlame,
		pageDetect.isCompare,
		pageDetect.isRepoTree,
		pageDetect.isRepoCommitList,
		pageDetect.isSingleCommit,
		pageDetect.isSingleFile,
	],
	awaitDomReady: false,
	deduplicate: false,
	init,
	deinit,
});
