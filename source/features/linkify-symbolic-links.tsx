import React from 'dom-chef';
import {elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import {prependAnchorsBeforeCodeOverlay} from '../github-helpers/dom-formatters.js';
import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';

function linkify(line: HTMLElement): void {
	if (elementExists('a[class*="CodeSizeDetails-module__PrimerLink"]')) {
		wrap(line.firstChild!, <a href={line.textContent} data-turbo-frame="repo-content-turbo-frame" />);
		prependAnchorsBeforeCodeOverlay(line);
	}
}

function init(signal: AbortSignal): void {
	observe('.react-code-line-contents', linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	exclude: [
		pageDetect.isRepoFile404,
	],
	init,
});

/*

Test URLs:

https://github.com/wmluke/angular-flash/blob/0.1.14/app/components

*/

