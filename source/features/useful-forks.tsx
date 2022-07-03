import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {RepoForkedIcon} from '@primer/octicons-react';

import select from 'select-dom';

import features from '.';
import {getRepo} from '../github-helpers';
import looseParseInt from '../helpers/loose-parse-int';
import isArchivedRepo from '../helpers/is-archived-repo';
import attachElement from '../helpers/attach-element';

function getUrl(): string {
	const url = new URL('https://useful-forks.github.io');
	url.searchParams.set('repo', getRepo()!.nameWithOwner);
	return url.href;
}

async function init(): Promise<void | false> {
	// TODO [2022-06-01]: Remove `.social-count` (GHE)
	const forkCount = await elementReady('#repo-network-counter, .social-count[href$="/network/members"]');
	if (looseParseInt(forkCount) === 0) {
		return false;
	}

	const selector = pageDetect.isRepoForksList() ? '#network' : '#repo-content-pjax-container h2';
	const container = await elementReady(selector, {waitForChildren: false});
	container!.prepend(
		<a className="btn mb-2 float-right" target="_blank" href={getUrl()} rel="noreferrer">
			<RepoForkedIcon className="mr-2"/>
			Find useful forks
		</a>,
	);
}

function createBannerLink(): JSX.Element {
	// It must return an element for `attachElement`. It includes a space
	return (
		<span> You can find <a href={getUrl()}>useful-forks.github.io</a></span>
	);
}

function initArchivedRepoBanner(): void {
	attachElement({
		anchor: '.flash-full',
		position: 'append',
		getNewElement: createBannerLink,
	});
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
	init,
}, {
	include: [
		isArchivedRepo,
	],
	init: initArchivedRepoBanner,
});
