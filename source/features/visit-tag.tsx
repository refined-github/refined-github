import React from 'react';
import {ArrowUpRightIcon, CodeIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import {branchSelector} from '../github-helpers/selectors.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {wrapAll} from '../helpers/dom-utils.js';
import {buildRepoURL} from '../github-helpers/index.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';

async function addLink(branchSelector: HTMLButtonElement): Promise<void> {
	const tag = branchSelector.getAttribute('aria-label')?.replace(/ tag$/, '');
	if (!tag) {
		features.log.error(import.meta.url, 'Tag not found in DOM. The feature needs to be updated');
		return;
	}

	wrapAll(
		[
			branchSelector,
			<a
				className="btn px-2 tooltipped tooltipped-se"
				href={buildRepoURL('releases/tag', tag)}
				aria-label="Visit tag"
			>
				<ArrowUpRightIcon className="v-align-middle"/>
			</a>,
		],
		<div className="d-flex gap-2"/>,
	);
}

function replaceIcon(tagIcon: SVGElement): void {
	// https://github.com/refined-github/refined-github/issues/6499#issuecomment-1505256426
	tagIcon.replaceWith(<CodeIcon/>);
}

function clarifyIcon(signal: AbortSignal): void {
	observe('.Link[href*="/tree/"] svg.octicon-tag', replaceIcon, {signal});
}

function init(signal: AbortSignal): void {
	observe(`:is(${branchSelector}):has(.octicon-tag)`, addLink, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isHasSelectorSupported,
	],
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	init,
}, {
	include: [
		pageDetect.isReleasesOrTags,
		pageDetect.isSingleReleaseOrTag,
	],
	init: clarifyIcon,
});

/*

Test URLs:

- https://github.com/refined-github/refined-github/tree/23.11.15
- https://github.com/refined-github/refined-github/blob/23.4.10/.editorconfig

Second part:

- https://github.com/refined-github/refined-github/releases
- https://github.com/refined-github/refined-github/releases/tag/23.11.15
- https://github.com/saadeghi/daisyui/releases/tag/v4.4.15

*/
