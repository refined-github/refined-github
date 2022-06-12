import './toggle-files-button.css';
import cache from 'webext-storage-cache';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {FoldIcon, UnfoldIcon, ArrowUpIcon} from '@primer/octicons-react';

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

	// Remove notice after the first click
	select('.rgh-files-hidden-notice')?.remove();
}

async function init(): Promise<Deinit> {
	const repoContent = (await elementReady('.repository-content'))!;

	if (await cache.get<boolean>(cacheKey)) {
		repoContent.classList.add('rgh-files-hidden');

		// Add notice so the user knows that the list was collapsed #5524
		select('.Box', repoContent)!.after(
			// 19px align this icon with the <UnfoldIcon/> above it
			<div
				className="mb-3 mt-n3 py-1 text-right text-small color-fg-subtle rgh-files-hidden-notice"
				style={{paddingRight: '19px'}}
			>
				The file list was collapsed via Refined GitHub <ArrowUpIcon className="v-align-middle"/>
			</div>,
		);
	}

	return [
		observeElement(repoContent, addButton),
		delegate(document, '.rgh-toggle-files, .rgh-files-hidden-notice', 'click', toggleHandler),
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
