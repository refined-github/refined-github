import React from 'dom-chef';
import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function init(): false | void {
	const originalPreviousNext = $('.commit .BtnGroup.float-right');
	if (!originalPreviousNext) {
		return false;
	}

	// Wrap the button in a <div> to avoid #4503
	$('#files')!.after(
		<div className="d-flex flex-justify-end mb-3">
			{originalPreviousNext.cloneNode(true)}
		</div>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRCommit,
	],
	deduplicate: 'has-rgh-inner',
	awaitDomReady: true,
	init,
});

/*
Test URLs:

Condensed commit: https://github.com/refined-github/refined-github/pull/4448/commits/0b8966c918eae11da9fc992368741757088edf08
Regular commit: https://github.com/refined-github/refined-github/pull/5113/commits/5b7282afc40b013f5928271fb6740cf70b4e4295

*/
