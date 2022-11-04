import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {RepoForkedIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import {getRepo} from '../github-helpers';
import looseParseInt from '../helpers/loose-parse-int';
import {assertNodeContent} from '../helpers/dom-utils';
import observe from '../helpers/selector-observer';

function getUrl(): string {
	const url = new URL('https://useful-forks.github.io');
	url.searchParams.set('repo', getRepo()!.nameWithOwner);
	return url.href;
}

async function init(): Promise<void | false> {
	const forkCount = await elementReady('#repo-network-counter');
	if (looseParseInt(forkCount) === 0) {
		return false;
	}

	const selector = pageDetect.isRepoForksList() ? '#network' : '#repo-content-pjax-container h2';
	const container = await elementReady(selector, {waitForChildren: false});
	container!.prepend(
		<a className="btn mb-2 float-right" href={getUrl()} target="_blank" rel="noreferrer">
			<RepoForkedIcon className="mr-2"/>
			Find useful forks
		</a>,
	);
}

function addLinkToBanner(label: HTMLElement): void {
	if (label.textContent!.trim() !== 'Public archive') {
		return;
	}

	const banner = select('#js-repo-pjax-container > .flash-warn:first-child')!;
	assertNodeContent(banner.lastChild, /repository has been archived/).after(
		' You can use ',
		<a href={getUrl()} target="_blank" rel="noreferrer">useful-forks.github.io</a>,
	);
}

function initArchivedRepoBanner(signal: AbortSignal): void {
	observe('[itemprop="name"] ~ .Label--attention', addLinkToBanner, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoForksList,
		pageDetect.isRepoNetworkGraph,
	],
	exclude: [
		pageDetect.isEnterprise,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh',
	init,
}, {
	include: [
		pageDetect.hasRepoHeader,
	],
	awaitDomReady: false,
	init: initArchivedRepoBanner,
});

/*
Test URLs:

https://github.com/refined-github/refined-github/network/members

https://github.com/refined-github/refined-github/network
https://github.com/probot/template/blob/master/CODE_OF_CONDUCT.md?rgh-link-date=2022-10-12T08%3A11%3A41Z
*/
