import './link-to-compare-diff.css';
import React from 'dom-chef';
import {elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {wrapAll} from '../helpers/dom-utils.js';
import selectHas from '../helpers/select-has.js';

function init(): void {
	const changedFilesSummary = selectHas('.Box li:has(.octicon-file-diff)')!;
	wrapAll(
		<a className="no-underline rgh-link-to-compare-diff" href="#files_bucket"/>,
		...changedFilesSummary.children,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	exclude: [
		() => elementExists('.tabnav'), // The commit list and compare diff are in two separate tabs
	],
	deduplicate: 'has-rgh-inner',
	awaitDomReady: true, // DOM-based filter
	init,
});

/*

Test URLs:

Separate tabs: https://github.com/refined-github/sandbox/compare/buncha-files...default-a
One view: https://github.com/refined-github/sandbox/compare/default-a...buncha-files

*/
