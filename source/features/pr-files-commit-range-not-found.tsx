import * as pageDetect from 'github-url-detection';
import select from 'select-dom';

import features from '../feature-manager.js';

function init(): void {
	// Link to navigate to all changes is nested in a paragraph of a blankslate div
	// The link only exists if not changes where found
	const latestChangesLink = select.last('.blankslate > p > a');
	if (latestChangesLink) {
		latestChangesLink.click();
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	awaitDomReady: true,
	init,
});
