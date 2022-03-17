import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {BookIcon, CheckIcon, DiffIcon, DiffModifiedIcon} from '@primer/octicons-react';

import features from '.';
import selectHas from '../helpers/select-has';
import {onDiffFileLoad} from '../github-events/on-fragment-load';

function makeLink(type: string, icon: Element, selected: boolean): JSX.Element {
	const url = new URL(location.href);
	url.searchParams.set('diff', type);
	const classes = pageDetect.isPR()
		? 'tooltipped tooltipped-s d-none d-lg-block ml-2 color-icon-secondary color-fg-muted'
		: 'tooltipped tooltipped-s btn btn-sm BtnGroup-item ' + (selected ? 'selected' : '');

	return (
		<a
			className={classes}
			aria-label={`Switch to the ${type} diff view`}
			href={url.href}
		>
			{icon}
		</a>
	);
}

function createDiffStyleToggle(): DocumentFragment {
	const isUnified = select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href*="diff=unified"]', // Link in single commit
	]);

	if (pageDetect.isPR()) {
		return isUnified
			? makeLink('split', <BookIcon className="v-align-middle"/>, false)
			: makeLink('unified', <DiffIcon className="v-align-middle"/>, false);
	}

	return (
		<>
			{makeLink('unified', <DiffIcon/>, isUnified)}
			{makeLink('split', <BookIcon/>, !isUnified)}
		</>
	);
}

function isHidingWhitespace(): boolean {
	// The selector is the native button
	return new URL(location.href).searchParams.get('w') === '1' || select.exists('button[name="w"][value="0"]:not([hidden])');
}

function createWhitespaceButton(): HTMLElement {
	const url = new URL(location.href);

	if (isHidingWhitespace()) {
		url.searchParams.delete('w');
	} else {
		url.searchParams.set('w', '1');
	}

	const classes = pageDetect.isPR()
		? 'tooltipped tooltipped-s d-none d-lg-block color-icon-secondary color-fg-muted'
		: 'tooltipped tooltipped-s btn btn-sm tooltipped ' + (isHidingWhitespace() ? 'color-text-tertiary color-fg-subtle' : '');

	return (
		<a
			href={url.href}
			data-hotkey="d w"
			className={classes}
			aria-label={`${isHidingWhitespace() ? 'Show' : 'Hide'} whitespace changes`}
		>
			{pageDetect.isPR() ? <DiffModifiedIcon className="v-align-middle"/> : <>{isHidingWhitespace() && <CheckIcon/>} No Whitespace</>}
		</a>
	);
}

function initPR(): false | void {
	const originalToggle = pageDetect.isEnterprise()
		? selectHas('details:has(.js-diff-settings)')! // TODO [2022-05-01]: Remove GHE code
		: selectHas('details:has([aria-label="Diff settings"])')!.parentElement!;

	if (!isHidingWhitespace() || pageDetect.isEnterprise()) {
		originalToggle.after(
			<div className="diffbar-item d-flex">{createWhitespaceButton()}</div>,
		);
	}

	originalToggle.after(
		<div className="diffbar-item d-flex">{createDiffStyleToggle()}</div>,
	);

	// Trim title
	const prTitle = select('.pr-toolbar .js-issue-title');
	if (prTitle && select.exists('.pr-toolbar progress-bar')) { // Only review view has progress-bar
		prTitle.style.maxWidth = '24em';
		prTitle.title = prTitle.textContent!;
	}

	originalToggle.classList.add('d-lg-none');

	// Make space for the new button by removing "Changes from" #655
	select('[data-hotkey="c"] strong')!.previousSibling!.remove();

	// Remove extraneous padding around "Clear filters" button
	select('.subset-files-tab')?.classList.replace('px-sm-3', 'ml-sm-2');
}

function initCommitAndCompare(): false | void {
	select('#toc')!.prepend(
		<div className="float-right d-flex">
			<div className="d-flex ml-3 BtnGroup">{createWhitespaceButton()}</div>
		</div>,
	);
}

const shortcuts = {
	'd w': 'Show/hide whitespaces in diffs',
};

void features.add(import.meta.url, {
	shortcuts,
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit,
	],
	exclude: [
		pageDetect.isPRFile404,
	],
	deduplicate: 'has-rgh-inner',
	init: initPR,
}, {
	shortcuts,
	include: [
		pageDetect.isSingleCommit,
	],
	init: initCommitAndCompare,
}, {
	shortcuts,
	include: [
		pageDetect.isCompare,
	],
	additionalListeners: [
		onDiffFileLoad,
	],
	onlyAdditionalListeners: true,
	init: initCommitAndCompare,
});
