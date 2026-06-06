import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $$, $optional} from 'select-dom';

import features from '../feature-manager.js';

function init(): false | void {
	if (pageDetect.isRepoCommitList()) {
		const paginationButtons = $$([
			'.paginate-container a',
			'[aria-label="Pagination"] a',
		]);
		if (paginationButtons.length === 0) {
			return false;
		}

		// The toolbar is guaranteed to be the first child of the pagination container's parent
		const container = $([
			'.paginate-container',
			'[aria-label="Pagination"]',
		]).parentElement!;

		const toolbar = container.firstElementChild!;
		if (!toolbar) {
			return false;
		}

		toolbar.append(
			<div className="ButtonGroup d-none d-md-block ml-auto">
				{paginationButtons.map(button => button.cloneNode(true))}
			</div>,
		);
		return;
	}

	const originalPreviousNext = $optional('.commit .float-right.ButtonGroup') // Legacy
		?? $optional('[class^="prc-ButtonGroup-ButtonGroup"]:has(a[aria-label$="previous commit" i])');
	if (!originalPreviousNext) {
		return false;
	}

	// Wrap the button in a <div> to avoid #4503
	$([
		'#files', // Legacy
		'[class^="DiffPlaceholder-module__DiffPlaceholderSVG"]',
	]).after(
		<div className="d-flex flex-justify-end mb-3 tmp-mb-3">
			{originalPreviousNext.cloneNode(true)}
		</div>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRCommit,
		pageDetect.isRepoCommitList,
	],
	deduplicate: 'has-rgh-inner',
	awaitDomReady: true,
	init,
});

/*
Test URLs:

Condensed commit: https://github.com/refined-github/refined-github/pull/4448/commits/0b8966c918eae11da9fc992368741757088edf08
Regular commit: https://github.com/refined-github/refined-github/pull/5113/commits/5b7282afc40b013f5928271fb6740cf70b4e4295
Commit list: https://github.com/refined-github/refined-github/commits/main

*/
