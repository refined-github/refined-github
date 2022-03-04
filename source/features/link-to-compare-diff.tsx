import './link-to-compare-diff.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {wrapAll} from '../helpers/dom-utils';

function init(): void {
	const changedFilesSummary = select('.Box .octicon-file-diff')!.closest('li')!;
	wrapAll(
		[...changedFilesSummary.children],
		<a className="Link--muted" href="#diff">,
	);
	document.body.classList.add('rgh-link-to-compare-diff');
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
