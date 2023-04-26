import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import {buildRepoURL} from '../github-helpers';

function addLinkToBanner(banner: HTMLElement): void {
	if (banner.lastChild!.textContent!.includes('repository has been archived')) {
		banner.lastChild!.after(
			' You can check out ',
			<a href={buildRepoURL('forks')}>its forks</a>,
			'.',
		);
	}
}

function init(signal: AbortSignal): void {
	observe('#js-repo-pjax-container > .flash-warn:first-child', addLinkToBanner, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});

/*
Test URLs:

https://github.com/probot/template/blob/master/CODE_OF_CONDUCT.md?rgh-link-date=2022-10-12T08%3A11%3A41Z
*/
