import './toggle-files-button.css';
import {$} from 'select-dom';
import {CachedValue} from 'webext-storage-cache';
import React from 'dom-chef';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {ChevronDownIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';

const wereFilesHidden = new CachedValue<boolean>('files-hidden');
const toggleButtonClass = 'rgh-toggle-files';

function addButton(filesBox: HTMLElement): void {
	$('ul:has(.octicon-history)', filesBox)?.append(
		<button
			type="button"
			className={`btn-octicon ${toggleButtonClass}`}
			aria-label="Hide files"
		>
			<ChevronDownIcon/>
		</button>,
	);
}

type Targets = {
	fileList: HTMLElement;
	buttonWrapper: Element;
};

function getTargets(): Targets {
	const fileList = $('[aria-labelledby="files"]')!;
	const buttonWrapper = fileList.nextElementSibling!;
	return {fileList, buttonWrapper};
}

function firstCollapseOnDesktop(targets = getTargets()): void {
	targets.fileList.classList.remove('d-md-block');
	targets.buttonWrapper.classList.remove('d-md-none');
}

async function toggleList(): Promise<void> {
	const targets = getTargets();
	const button = targets.buttonWrapper.firstElementChild as HTMLButtonElement;

	if (targets.fileList.classList.contains('d-md-block')) {
		// On the first click, collapse the list and enable native toggling on desktop
		firstCollapseOnDesktop(targets);
		if (window.matchMedia('(min-width: 768px)').matches) {
			// We just hid the file list, no further action is necessary on desktop
			void wereFilesHidden.set(true);
			return;
		}

		// On mobile nothing visually happened because by default the list is already hidden, so it continues to actually hide the list via the native button.
	}

	// Toggle file list via native button, open or close
	button.click();
}

async function updateView(anchor: HTMLHeadingElement): Promise<void> {
	const filesBox = anchor.parentElement!;
	addButton(filesBox);
	if (await wereFilesHidden.get()) {
		// This only applies on desktop; Mobile already always starts collapsed and we're not changing that
		firstCollapseOnDesktop();
	}
}

async function recordToggle({detail}: DelegateEvent<CustomEvent>): Promise<void> {
	await wereFilesHidden.set(!detail.open);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('.Box h2#files', updateView, {signal});
	delegate(`.${toggleButtonClass}`, 'click', toggleList, {signal});
	delegate('#files ~ .Details', 'details:toggled', recordToggle, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isHasSelectorSupported,
	],
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		pageDetect.isRepoFile404,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/refined-github
https://github.com/refined-github/sandbox/tree/other-branch

*/
