import './extend-diff-expander.css';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function expandDiff(event: delegate.Event): void {
	// Skip if the user clicked directly on the icon
	if (!(event.target as Element).closest('.js-expand')) {
		select('.js-expand', event.delegateTarget)!.click();
	}
}

function init(): void {
	delegate(document, '.diff-view .js-expandable-line', 'click', expandDiff);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isCommit,
		pageDetect.isCompare,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
