import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {BookIcon, CheckIcon, DiffIcon} from '@primer/octicons-react';

import features from '.';

function createDiffStyleToggle(): DocumentFragment {
	const url = new URL(location.href);
	const isUnified = select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href$=unified]' // Link in single commit
	]);

	function makeLink(type: string, icon: Element, selected: boolean): HTMLElement {
		url.searchParams.set('diff', type);
		return (
			<a
				className={`btn btn-sm BtnGroup-item tooltipped tooltipped-s ${selected ? 'selected' : ''}`}
				aria-label={`Show ${type} diffs`}
				href={url.href}
			>
				{icon}
			</a>
		);
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
			className={`btn btn-sm btn-outline tooltipped tooltipped-s ${isHidingWhitespace ? 'bg-gray-light text-gray-light color-text-tertiary' : ''}`}
			aria-label={`${isHidingWhitespace ? 'Show' : 'Hide'} whitespace in diffs`}
		>
			{isHidingWhitespace && <CheckIcon/>} No Whitespace
		</a>
	);
}

function wrap(...elements: Node[]): DocumentFragment {
	if (pageDetect.isSingleCommit() || pageDetect.isCompare()) {
		return (
			<div className="float-right">
				{elements.map(element => <div className="ml-3 BtnGroup">{element}</div>)}
			</div>
		);
	}

	return <>{elements.map(element => <div className="diffbar-item">{element}</div>)}</>;
}

function init(): false | void {
	const container = select([
		'#toc', // In single commit view
		'.pr-review-tools' // In review view
	]);
	if (!container) {
		return false;
	}

	container.prepend(
		wrap(
			createDiffStyleToggle(),
			createWhitespaceButton()
		)
	);

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
		prUI.closest('details')!.remove();

		// Make space for the new button by removing "Changes from" #655
		select('[data-hotkey="c"]')!.firstChild!.remove();
	}
}

void features.add(__filebasename, {
	include: [
		// Disabled because of #2291 // pageDetect.isPRFiles
		pageDetect.isCommit,
		pageDetect.isCompare
	],
	shortcuts: {
		'd w': 'Show/hide whitespaces in diffs'
	},
	init
});
