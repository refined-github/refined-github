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
		[...changedFilesSummary.children],
		<a className="no-underline rgh-link-to-compare-diff" href="#files_bucket"/>,
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
