import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {RepoForkedIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import {getRepo} from '../github-helpers';
import looseParseInt from '../helpers/loose-parse-int';
import attachElement from '../helpers/attach-element';
import { assertNodeContent } from '../helpers/dom-utils';

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

function createBannerLink(): JSX.Element {
	// It must return an element for `attachElement`. It includes a space
	return (
		<span> You can use <a href={getUrl()} target="_blank" rel="noreferrer">useful-forks.github.io</a></span>
	);
}

function initArchivedRepoBanner(): void {
	const banner = select('#js-repo-pjax-container > .flash-warn:first-child')!;
	assertNodeContent(banner, 'repository has been archived');
	attachElement(banner, {
		append: createBannerLink,
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
	deduplicate: 'has-rgh',
	init,
}, {
	asLongAs: [
		pageDetect.isPublicRepo,
	],
	include: [
		pageDetect.isArchivedRepo,
	],
	// Can't because `isArchivedRepo` and `isPublicRepo` are DOM-based
	// awaitDomReady: false,
	init: initArchivedRepoBanner,
});
