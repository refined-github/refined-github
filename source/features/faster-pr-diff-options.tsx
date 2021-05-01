import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {BookIcon, CheckIcon, DiffIcon} from '@primer/octicons-react';

import features from '.';

function createDiffStyleToggle(): DocumentFragment {
	const parameters = new URLSearchParams(location.search);
	const isUnified = select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href$=unified]' // Link in single commit
	]);

	function makeLink(type: string, icon: Element, selected: boolean): HTMLElement {
		parameters.set('diff', type);
		return (
			<a
				className={`tooltipped tooltipped-s ${selected ? '' : 'text-gray color-text-secondary'} ${pageDetect.isPRFiles() ? 'd-none d-lg-block' : ''}`}
				aria-label={`Show ${type} diffs`}
				href={`?${String(parameters)}`}
			>
				{icon}
			</a>
		);
	}

	return (
		<>
			{makeLink('unified', <DiffIcon/>, isUnified)}
			<div className="mr-2"/>
			{makeLink('split', <BookIcon/>, !isUnified)}
		</>
	);
}

function createWhitespaceButton(): HTMLElement {
	const searchParameters = new URLSearchParams(location.search);
	const isHidingWhitespace = searchParameters.get('w') === '1';

	if (isHidingWhitespace) {
		searchParameters.delete('w');
	} else {
		searchParameters.set('w', '1');
	}

	return (
		<a
			href={`?${String(searchParameters)}`}
			data-hotkey="d w"
			className={`tooltipped tooltipped-s text-gray color-text-secondary ${isHidingWhitespace ? '' : 'text-bold'} ${pageDetect.isPRFiles() ? 'd-none d-lg-inline-block' : ''}`}
			aria-label={`${isHidingWhitespace ? 'Show' : 'Hide'} whitespace in diffs`}
		>
			{isHidingWhitespace && <CheckIcon/>} No Whitespace
		</a>
	);
}

function wrap(...elements: Node[]): DocumentFragment {
	if (pageDetect.isSingleCommit() || pageDetect.isCompare()) {
		return (
			<div className="float-right d-flex">
				{elements.map(element => <div className="d-flex ml-3">{element}</div>)}
			</div>
		);
	}

	return <>{elements.map(element => <div className="diffbar-item d-flex">{element}</div>)}</>;
}

function init(): false | void {
	const container = (pageDetect.isPRFiles() || pageDetect.isPRCommit()) ? select('.js-file-filter')?.closest('.flex-auto') : select('#toc');
	if (!container) {
		return false;
	}

	const wrappedButtons = wrap(
		createDiffStyleToggle(),
		createWhitespaceButton()
	);
	if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
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
