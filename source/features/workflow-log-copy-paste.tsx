import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';

function temporarilyHideNumbers(): void {
	const lines = select.all('.js-checks-log-details[open] .CheckStep-line-number');
	for (const line of lines) {
		line.hidden = true;
	}

	setTimeout(() => {
		for (const line of lines) {
			line.hidden = false;
		}
	});
}

function init(signal: AbortSignal): void {
	document.addEventListener('copy', temporarilyHideNumbers, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isActionJobRun,
	],
	init,
});
