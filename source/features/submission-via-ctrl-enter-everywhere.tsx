import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function addQuickSubmit(): void {
	$([
		'input#commit-summary-input',
		'textarea[aria-label="Describe this release"]',
	])!.classList.add('js-quick-submit');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNewFile,
		pageDetect.isEditingFile,
		pageDetect.isNewRelease,
		pageDetect.isEditingRelease,
	],
	exclude: [
		pageDetect.isBlank,
	],
	awaitDomReady: true,
	init: addQuickSubmit,
});
