import React from 'react';
import {ArrowUpRightIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import {branchSelector} from '../github-helpers/selectors.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {wrapAll} from '../helpers/dom-utils.js';
import {buildRepoURL} from '../github-helpers/index.js';

async function addLink(branchSelector: HTMLButtonElement): Promise<void> {
	const tag = branchSelector.getAttribute('aria-label');
	if (!tag) {
		features.log.error(import.meta.url, 'Tag not found in DOM. The feature needs to be updated');
		return;
	}

	wrapAll(
		[
			branchSelector,
			<a
				className="btn px-2 tooltipped tooltipped-se"
				href={buildRepoURL('releases/tag/', tag)}
				aria-label="Visit tag"
			>
				<ArrowUpRightIcon className="v-align-middle"/>
			</a>,
		],
		<div className="d-flex gap-2"/>,
	);
}

function init(signal: AbortSignal): void {
	observe(branchSelector, addLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	init,
});

/*

Test URLs:

- https://github.com/refined-github/refined-github/tree/23.11.15

*/
