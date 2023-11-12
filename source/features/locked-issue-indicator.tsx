import React from 'react';
import {LockIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import onetime from 'onetime';

import {$, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function addLock(element: HTMLElement): void {
	if (!elementExists('reactions-menu', element)) {
		// Add locked indicator to header
		$('.gh-header-meta')!.children[0].after(
			<div className="flex-shrink-0 mb-2 flex-self-start flex-md-self-center">
				<span title="Status: Locked" className="State d-flex flex-items-center">
					<LockIcon className="flex-items-center mr-1"/>
					Locked
				</span>
			</div>,
		);
		// Add locked indicator to sticky header
		$('.gh-header-sticky .flex-row')!.children[0].after(
			<div className="mr-2 mb-2 flex-shrink-0">
				<span title="Status: Locked" className="State d-flex flex-items-center">
					<LockIcon className="flex-items-center mr-1"/>
					Locked
				</span>
			</div>,
		);
	}
}

function init(signal: AbortSignal): void {
	observe('.pr-review-reactions', onetime(addLock), {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
		pageDetect.isPR,
	],
	init,
});

/**

## Test URLs

unlocked issue: https://github.com/refined-github/refined-github/issues/6551
locked issue: https://github.com/refined-github/refined-github/issues/6940

unlocked pr:
locked pr: https://github.com/refined-github/sandbox/pull/48

*/
