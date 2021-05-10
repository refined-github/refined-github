import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {BookIcon, CheckIcon, DiffIcon, DiffModifiedIcon} from '@primer/octicons-react';

import features from '.';

function isPRPage(): boolean {
	return pageDetect.isPRCommit() || pageDetect.isPRFiles();
}

function createDiffStyleToggle(): DocumentFragment {
	const url = new URL(location.href);
	const isUnified = url.searchParams.get('diff') === 'unified' || select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href$=unified]' // Link in single commit
	]);

	function makeLink(type: string, icon: Element, selected: boolean): HTMLElement {
		url.searchParams.set('diff', type);
		return (
			<a
				className={'tooltipped tooltipped-s ' + (isPRPage() ? 'd-none d-lg-block ml-2 color-icon-secondary' : `btn btn-sm BtnGroup-item ${selected ? 'selected' : ''}`)}
				aria-label={`Switch to the ${type} diff view`}
				href={url.href}
			>
				{icon}
			</a>
		);
	}

	if (isPRPage()) {
		return isUnified ?
			makeLink('split', <BookIcon/>, false) :
			makeLink('unified', <DiffIcon/>, false);
	}

	return (
		<>
			{makeLink('unified', <DiffIcon/>, isUnified)}
			{makeLink('split', <BookIcon/>, !isUnified)}
		</>
	);
}

function createWhitespaceButton(): HTMLElement {
	const url = new URL(location.href);
	const isHidingWhitespace = url.searchParams.get('w') === '1';

	if (isHidingWhitespace) {
		url.searchParams.delete('w');
	} else {
		url.searchParams.set('w', '1');
	}

	return (
		<a
			href={url.href}
			data-hotkey="d w"
			className={'tooltipped tooltipped-s ' + (isPRPage() ? `d-none d-lg-block color-icon-secondary ${isHidingWhitespace ? '' : 'color-icon-info'}` : `btn btn-sm btn-outline tooltipped ${isHidingWhitespace ? 'bg-gray-light text-gray-light color-text-tertiary' : ''}`)}
			aria-label={`${isHidingWhitespace ? 'Show' : 'Hide'} whitespace changes`}
		>
			{isPRPage() ? <DiffModifiedIcon/> : <>{isHidingWhitespace && <CheckIcon/>} No Whitespace</>}
		</a>
	);
}

function wrap(...elements: Node[]): DocumentFragment {
	if (isPRPage()) {
		return <>{elements.map(element => <div className="diffbar-item d-flex">{element}</div>)}</>;
	}

	return (
		<div className="float-right d-flex">
			{elements.map(element => <div className="d-flex ml-3 BtnGroup">{element}</div>)}
		</div>
	);
}

function init(): false | void {
	const container = isPRPage() ?
		select('.js-file-filter')?.closest('.flex-auto') :
		select('#toc');
	if (!container) {
		return false;
	}

	const wrappedButtons = wrap(
		createDiffStyleToggle(),
		createWhitespaceButton()
	);
	if (isPRPage()) {
		container.append(wrappedButtons);
	} else {
		container.prepend(wrappedButtons);
	}

	// Trim title
	const prTitle = select('.pr-toolbar .js-issue-title');
	if (prTitle && select.exists('.pr-toolbar progress-bar')) { // Only review view has progress-bar
		prTitle.style.maxWidth = '24em';
		prTitle.title = prTitle.textContent!;
	}

	// Remove previous options UI
	const singleCommitUI = select('[data-ga-load^="Diff, view"]');
	if (singleCommitUI) {
		singleCommitUI.remove();
		return;
	}

	const prUI = select('.js-diff-settings');
	if (prUI) {
		// Only show the native dropdown on medium and small screens #2597
		prUI.closest('details')!.classList.add('d-lg-none');

		// Make space for the new button by removing "Changes from" #655
		select('[data-hotkey="c"]')!.firstChild!.remove();
	}

	// Remove extraneous padding on "Clear filters" button
	const clearFiltersButton = select('.subset-files-tab');
	if (clearFiltersButton) {
		clearFiltersButton.classList.replace('px-sm-3', 'ml-2');
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isCommit,
		pageDetect.isCompare
	],
	shortcuts: {
		'd w': 'Show/hide whitespaces in diffs'
	},
	init
});
