import './toggle-files-button.css';
import cache from 'webext-storage-cache';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {FoldIcon, UnfoldIcon, ArrowUpIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import selectHas from '../helpers/select-has';
import attachElement from '../helpers/attach-element';
import observe from '../helpers/selector-observer';

const cacheKey = 'files-hidden';
const hiddenFilesClass = 'rgh-files-hidden';
const toggleButtonClass = 'rgh-toggle-files';
const noticeClass = 'rgh-files-hidden-notice';

// 19px align this icon with the <UnfoldIcon/> above it
const noticeStyle = {paddingRight: '19px'};

function addButton(filesBox: HTMLElement): void {
	attachElement(selectHas('ul:has(.octicon-history)', filesBox)!, {
		allowMissingAnchor: true,
		className: toggleButtonClass,
		append: () => (
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

function addFilesHiddenNotice(fileBox: Element): void {
	// Add notice so the user knows that the list was collapsed #5524
	attachElement(fileBox, {
		className: noticeClass,
		after: () => (
			<div
				className="mb-3 mt-n3 py-1 text-right text-small color-fg-subtle"
				style={noticeStyle}
			>
				The file list was collapsed via Refined GitHub <ArrowUpIcon className="v-align-middle"/>
			</div>
		),
	});
}

function toggle(toggle?: boolean): boolean {
	return document.body.classList.toggle(hiddenFilesClass, toggle);
}

async function toggleHandler(): Promise<void> {
	// Remove notice after the first click
	select(`.${noticeClass}`)?.remove();

	const isHidden = toggle();
	await cache.set(cacheKey, isHidden);
}

async function updateView(anchor: HTMLHeadingElement): Promise<void> {
	const filesBox = anchor.parentElement!;
	addButton(filesBox);
	if (await cache.get<boolean>(cacheKey)) {
		toggle(true);
		addFilesHiddenNotice(filesBox);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	// TODO: Use `.Box:has(> #files)` instead
	observe('.Box h2#files', updateView, {signal});
	delegate(`.${toggleButtonClass}, .${noticeClass}`, 'click', toggleHandler, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	init,
});
