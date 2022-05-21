import './toggle-files-button.css';
import cache from 'webext-storage-cache';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {FoldIcon, UnfoldIcon} from '@primer/octicons-react';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';

const cacheKey = 'files-hidden';

function addButton(): void {
	const commitsInfo = select('.repository-content .octicon-history')?.closest('ul');
	if (!commitsInfo || select.exists('.rgh-toggle-files')) {
		return;
	}

	commitsInfo.append(
		<button
			type="button"
			className="btn-octicon rgh-toggle-files"
			aria-label="Toggle files section"
		>
			<FoldIcon/>
			<UnfoldIcon/>
		</button>,
	);
}

async function toggleHandler(): Promise<void> {
	const isHidden = select('.repository-content')!.classList.toggle('rgh-files-hidden');
	await (isHidden ? cache.set(cacheKey, true) : cache.delete(cacheKey));
}

async function init(): Promise<Deinit[]> {
	const repoContent = (await elementReady('.repository-content'))!;
	if (await cache.get<boolean>(cacheKey)) {
		repoContent.classList.add('rgh-files-hidden');
	}

	return [
		observeElement(repoContent, addButton),
		delegate(document, '.rgh-toggle-files', 'click', toggleHandler),
	];
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	awaitDomReady: false,
	deduplicate: false,
	init,
});
