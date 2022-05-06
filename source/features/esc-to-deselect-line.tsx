import * as pageDetect from 'github-url-detection';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

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
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
