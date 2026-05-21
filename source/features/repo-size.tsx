import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import FileCodeIcon from 'octicons-plain-react/FileCode';
import prettyBytes from 'pretty-bytes';
import {$closest} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo} from '../github-helpers/index.js';

const repoSize = new CachedFunction('repo-size', {
	async updater(): Promise<number> {
		const {size} = await api.v3('');
		return size;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

async function init(): Promise<void> {
	const sidebarForksLinkIcon = await elementReady('.BorderGrid .octicon-repo-forked');
	const sizeInKB = await repoSize.get();

	$closest('.mt-2', sidebarForksLinkIcon)!.after(
		<h3 className="sr-only">Repository size</h3>,
		<div className="mt-2">
			<FileCodeIcon className="mr-2"/>
			<span>{prettyBytes(sizeInKB * 1024)}</span>
		</div>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
	],
	exclude: [
		pageDetect.isEmptyRepoRoot,
	],
	deduplicate: 'has-rgh-inner',
	init,
});

/*
Test URLs

Regular repo: https://github.com/refined-github/refined-github
Empty repo: https://github.com/refined-github/sandbox
Large repo: https://github.com/torvalds/linux
*/
