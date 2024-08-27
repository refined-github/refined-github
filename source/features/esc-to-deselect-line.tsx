import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {isEditable} from '../helpers/dom-utils.js';

function isLineSelected(): boolean {
	// Example hashes:
	// #L1
	// #L1-L7
	// #diff-1030ad175a393516333e18ea51c415caR1
	return /^#L|^#diff-[\da-f]+R\d+/.test(location.hash);
}

function listener({key, target}: KeyboardEvent): void {
	if (key === 'Escape' && isLineSelected() && !isEditable(target)) {
		location.hash = '#no-line'; // Update UI, without `scroll-to-top` behavior
		history.replaceState(undefined, document.title, location.pathname); // Drop remaining # from url
	}
}

function init(signal: AbortSignal): void {
	document.body.addEventListener('keyup', listener, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasCode,
	],
	init,
});

/*

Test URLs:

1. Visit https://github.com/refined-github/refined-github/blob/132272786fdc058193e089d8c06f2a158844e101/source/features/esc-to-deselect-line.tsx#L11
2. Press Esc
3. See selected line become deselected

*/
