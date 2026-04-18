import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import { $optional } from 'select-dom/strict.js';

import features from '../feature-manager.js';
import { repositionAnchors } from '../github-helpers/dom-formatters.js';
import { wrap } from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

function linkify(line: HTMLElement): void {
	if ($optional('a[class*="CodeSizeDetails-module__PrimerLink"]')?.textContent === 'Symbolic Link') {
		wrap(line.firstChild!, <a href={line.textContent} data-turbo-frame='repo-content-turbo-frame' />);
		repositionAnchors(line);
	}
}

function init(signal: AbortSignal): void {
	observe('.react-code-line-contents .react-file-line', linkify, { signal });
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
