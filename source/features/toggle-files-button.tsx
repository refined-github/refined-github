import './toggle-files-button.css';
import select from 'select-dom';
import cache from 'webext-storage-cache';
import React from 'dom-chef';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {ChevronDownIcon, FoldIcon, UnfoldIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import selectHas from '../helpers/select-has.js';
import observe from '../helpers/selector-observer.js';

const cacheKey = 'files-hidden';
const toggleButtonClass = 'rgh-toggle-files';

function addButton(filesBox: HTMLElement): void {
	selectHas('ul:has(.octicon-history)', filesBox)?.append(
		<button
			type="button"
			className={`btn-octicon ${toggleButtonClass}`}
			aria-label="Hide files"
		>
			<ChevronDownIcon/>
		</button>,
	);
}

function toggle(toggle?: boolean): boolean {
	const fileList = select('[aria-labelledby="files"]')!;
	const button = fileList.nextElementSibling!;
	const isHidden = fileList.classList.toggle('d-md-block', toggle);
	button.classList.toggle('d-md-none', isHidden);
	return isHidden;
}

async function toggleList(): Promise<void> {
	const fileList = select('[aria-labelledby="files"]')!;
	const button = fileList.nextElementSibling!;

	if (fileList.classList.contains('d-md-block')) {
		// Desktop, collapse list and enable native toggling
		fileList.classList.remove('d-md-block');
		button.classList.remove('d-md-none');
	} else {
		// Toggle file list via native button
		(button.firstElementChild as HTMLButtonElement).click()
	}
}

async function updateView(anchor: HTMLHeadingElement): Promise<void> {
	const filesBox = anchor.parentElement!;
	addButton(filesBox);
	if (await cache.get<boolean>(cacheKey)) {
		// toggle(true);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	// TODO: Use `.Box:has(> #files)` instead
	observe('.Box h2#files', updateView, {signal});
	delegate(`.${toggleButtonClass}`, 'click', toggleList, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	init,
});
