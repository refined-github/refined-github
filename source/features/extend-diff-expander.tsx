import './extend-diff-expander.css';
import {$} from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function expandDiff(event: DelegateEvent): void {
	// Skip if the user clicked directly on the icon
	if (!(event.target as Element).closest('.js-expand')) {
		$('.js-expand', event.delegateTarget)!.click();
	}
}

function init(signal: AbortSignal): void {
	document.body.classList.add('rgh-extend-diff-expander');
	delegate('.diff-view .js-expandable-line', 'click', expandDiff, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasFiles,
	],
	init,
});
