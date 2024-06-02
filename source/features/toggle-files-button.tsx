import './toggle-files-button.css';
import React from 'dom-chef';
import {$, expectElement} from 'select-dom';
import delegate from 'delegate-it';
import {CachedFunction} from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';
import ChevronDownIcon from 'octicons-plain-react/ChevronDown';
import ChevronUpIcon from 'octicons-plain-react/ChevronUp';
import ArrowUpIcon from 'octicons-plain-react/ArrowUp';

import features from '../feature-manager.js';
import attachElement from '../helpers/attach-element.js';
import observe from '../helpers/selector-observer.js';
import {cacheByRepo} from '../github-helpers/index.js';

const wasHidden = new CachedFunction('toggle-files-button', {
	async updater(): Promise<boolean> {
		return false;
	},
	cacheKey: cacheByRepo,
});
const hiddenFilesClass = 'rgh-files-hidden';
const toggleButtonClass = 'rgh-toggle-files';
const noticeClass = 'rgh-files-hidden-notice';

// 19px align this icon with the <ChevronUpIcon/> above it
const noticeStyle = {paddingRight: '16px'};

function addButton(commitsLink: HTMLElement): void {
	// It won't work with :has(), too many nested boxes
	commitsLink.closest('[class^="Box"]')!.append(
		<button
			type="button"
			className={`btn-octicon ${toggleButtonClass}`}
			aria-label="Toggle files section"
		>
			<ChevronDownIcon/>
			<ChevronUpIcon/>
		</button>,
	);
}

function addFilesHiddenNotice(): void {
	// Add notice so the user knows that the list was collapsed #5524
	attachElement(expectElement('[aria-labelledby="folders-and-files"]'), {
		className: noticeClass,
		after: () => (
			<div
				className="py-1 text-right text-small color-fg-subtle"
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

	// eslint-disable-next-line unicorn/prefer-ternary -- No.
	if (toggle()) {
		await wasHidden.applyOverride([], true);
	} else {
		await wasHidden.delete();
	}
}

async function updateView(button: HTMLElement): Promise<void> {
	addButton(button);
	if (await wasHidden.getCached()) {
		toggle(true);
		addFilesHiddenNotice();
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe('[aria-label="Commit history"]', updateView, {signal});
	delegate(`.${toggleButtonClass}, .${noticeClass}`, 'click', toggleHandler, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/refined-github

https://github.com/refined-github/sandbox/tree/other-branch

*/
