import './hide-yarn-berry-cache.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

/**
 * Collapse the yarn berry cache diff blocks on PR files or compare page
 */
function collapseYarnCacheDiff(divElement: HTMLDivElement): void {
	divElement.classList.remove('open', 'Details--on');
}

/**
 * Collapse the yarn berry cache directory in the file tree list on PR files page
 */
function collapseYarnCacheDirectory(buttonElement: HTMLButtonElement): void {
	if (buttonElement.textContent === '.yarn' || buttonElement.textContent === '.yarn/cache') {
		buttonElement.ariaExpanded = 'false';
	}
}

// Select diff elements which is yarn berry cache
const yarnBinaryDiffSelector = 'div[id^="diff-"]:is([data-tagsearch-path*=".yarn/cache"])';

// Select directory elements from the file tree list on left side
const yarnBinaryDirectorySelector = 'button[aria-expanded="true"].ActionList-content';

function init(): void {
	observe(yarnBinaryDiffSelector, collapseYarnCacheDiff);
	observe(yarnBinaryDirectorySelector, collapseYarnCacheDirectory);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isCompare,
	],
	init,
});

/*
Test URLs

on PR:
- https://github.com/refined-github/sandbox/pull/78/files

on compare:
- https://github.com/refined-github/sandbox/compare/default-a...effx13:sandbox:test-yarn-berry
*/
