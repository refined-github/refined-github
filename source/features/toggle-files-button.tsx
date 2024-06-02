import './toggle-files-button.css';
import React from 'dom-chef';
import {$} from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import FoldIcon from 'octicons-plain-react/Fold';
import UnfoldIcon from 'octicons-plain-react/Unfold';
import ArrowUpIcon from 'octicons-plain-react/ArrowUp';

import features from '../feature-manager.js';
import attachElement from '../helpers/attach-element.js';
import observe from '../helpers/selector-observer.js';

const cacheKey = 'files-hidden';
const hiddenFilesClass = 'rgh-files-hidden';
const toggleButtonClass = 'rgh-toggle-files';
const noticeClass = 'rgh-files-hidden-notice';

// 19px align this icon with the <UnfoldIcon/> above it
const noticeStyle = {paddingRight: '19px'};

function addButton(filesBox: HTMLElement): void {
	attachElement(filesBox, {
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
	$(`.${noticeClass}`)?.remove();

	const isHidden = toggle();
}

async function init(signal: AbortSignal): Promise<void> {
	observe('[class^="Box"]:has([aria-label="Commit history"])', addButton, {signal});
	delegate(`.${toggleButtonClass}, .${noticeClass}`, 'click', toggleHandler, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	init,
});
