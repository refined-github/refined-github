import './link-to-compare-diff.css';

import React from 'dom-chef';
import {elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {wrapAll} from '../helpers/dom-utils.js';

function linkify(changedFilesSummary: HTMLElement): void {
	wrapAll(
		<a className="no-underline rgh-link-to-compare-diff" href="#files_bucket" />,
		...changedFilesSummary.children,
	);
}

function init(signal: AbortSignal): void {
	observe('.Box li:has(.octicon-file-diff)', linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	exclude: [
		() => elementExists('.tabnav:not(.CommentBox-header)'), // The commit list and compare diff are in two separate tabs
	],
	init,
});

/*

Test URLs:

Separate tabs: https://github.com/refined-github/sandbox/compare/buncha-files...default-a
One view: https://github.com/refined-github/sandbox/compare/default-a...buncha-files

*/
