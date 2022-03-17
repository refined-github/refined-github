import './link-to-compare-diff.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {wrapAll} from '../helpers/dom-utils';
import selectHas from '../helpers/selectHas';

function init(): void {
	const changedFilesSummary = selectHas('li:has(.Box .octicon-file-diff)')!;
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
		() => select.exists('.tabnav'), // The commit list and compare diff are in two separate tabs
	],
	deduplicate: 'has-rgh-inner',
	init,
});
