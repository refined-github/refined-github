import './toggle-files-button.css';
import cache from 'webext-storage-cache';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {FoldIcon, UnfoldIcon, ArrowUpIcon} from '@primer/octicons-react';

import features from '.';
import attachElement from '../helpers/attach-element';
import observeElement from '../helpers/simplified-element-observer';

const cacheKey = 'files-hidden';
const hiddenFilesClass = 'rgh-files-hidden';
const toggleButtonClass = 'rgh-toggle-files';
const noticeClass = 'rgh-files-hidden-notice';

// 19px align this icon with the <UnfoldIcon/> above it
const noticeStyle = {paddingRight: '19px'};

function addButton(): void {
	attachElement({
		anchor: select('.repository-content .octicon-history')?.closest('ul'),
		allowMissingAnchor: true,
		className: toggleButtonClass,
		position: 'append',
		getNewElement: () => (
			<button
				type="button"
				className="btn-octicon"
				aria-label="Toggle files section"
			>
				<FoldIcon/>
				<UnfoldIcon/>
			</button>
		),
	});
}

function addFilesHiddenNotice(repoContent: Element): void {
	// Add notice so the user knows that the list was collapsed #5524
	attachElement({
		anchor: select('.Box', repoContent),
		position: 'after',
		className: noticeClass,
		getNewElement: () => (
			<div
				className="mb-3 mt-n3 py-1 text-right text-small color-fg-subtle"
				style={noticeStyle}
			>
				The file list was collapsed via Refined GitHub <ArrowUpIcon className="v-align-middle"/>
			</div>
		),
	});
}

async function toggleHandler(): Promise<void> {
	// Remove notice after the first click
	select(`.${noticeClass}`)?.remove();

	const isHidden = select('.repository-content')!.classList.toggle(hiddenFilesClass);
	await cache.set(cacheKey, isHidden);
}

async function init(): Promise<Deinit> {
	const repoContent = (await elementReady('.repository-content'))!;

	if (await cache.get<boolean>(cacheKey)) {
		repoContent.classList.add(hiddenFilesClass);
		addFilesHiddenNotice(repoContent);
	}

	return [
		observeElement(repoContent, addButton),
		delegate(document, `.${toggleButtonClass}, .${noticeClass}`, 'click', toggleHandler),
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
