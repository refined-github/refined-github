import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import {prependAnchorsBeforeCodeOverlay} from '../github-helpers/dom-formatters.js';
import features from '../feature-manager.js';

function init(): void {
	if ($optional([
		'[class*="CodeSizeDetails-module__PrimerLink"]',
		'.file-mode', // Old view - Remove after July 2026
	])?.textContent.toLowerCase() === 'symbolic link') {
		const line = $([
			'.react-code-line-contents',
			'.js-file-line', // Old view - Remove after July 2026
		]);
		wrap(line.firstChild!, <a href={line.textContent} data-turbo-frame="repo-content-turbo-frame" />);
		prependAnchorsBeforeCodeOverlay(line);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	exclude: [
		pageDetect.isRepoFile404,
	],
	deduplicate: 'has-rgh',
	awaitDomReady: true, // Small page
	init,
});

/*

Test URLs:

https://github.com/wmluke/angular-flash/blob/0.1.14/app/components

*/
