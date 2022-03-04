import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {onDiffFileLoad} from '../github-events/on-fragment-load';

function init(): void {
	for (const header of select.all('.file-header:not(.sticky-file-header)')) {
		// Prefer `.sticky-file-header` over `.position-sticky` since the former also sets proper `z-index`
		header.classList.add('sticky-file-header', 'top-0', 'js-sticky', 'js-position-sticky');
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleCommit,
	],
	init,
}, {
	include: [
		pageDetect.isCompare,
	],
	additionalListeners: [
		onDiffFileLoad,
	],
	onlyAdditionalListeners: true,
	init,
});
