import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {BookIcon, CheckIcon, DiffIcon, DiffModifiedIcon} from '@primer/octicons-react';

import features from '.';

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
			? makeLink('split', <BookIcon/>, false)
			: makeLink('unified', <DiffIcon/>, false);
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

	const classes = pageDetect.isPR()
		? 'tooltipped tooltipped-s d-none d-lg-block color-icon-secondary color-fg-muted ' + (isHidingWhitespace ? '' : 'color-icon-info color-fg-accent')
		: 'tooltipped tooltipped-s btn btn-sm tooltipped ' + (isHidingWhitespace ? 'color-text-tertiary color-fg-muted' : '');

	return (
		<a
			href={url.href}
			data-hotkey="d w"
			className={classes}
			aria-label={`${isHidingWhitespace ? 'Show' : 'Hide'} whitespace changes`}
		>
			{pageDetect.isPR() ? <DiffModifiedIcon/> : <>{isHidingWhitespace && <CheckIcon/>} No Whitespace</>}
		</a>
	);
}

function initPR(): false | void {
	select('.js-file-filter')!.parentElement!.append(
		<div className="diffbar-item d-flex">{createDiffStyleToggle()}</div>,
		<div className="diffbar-item d-flex">{createWhitespaceButton()}</div>,
	);

	// Trim title
	const prTitle = select('.pr-toolbar .js-issue-title');
	if (prTitle && select.exists('.pr-toolbar progress-bar')) { // Only review view has progress-bar
		prTitle.style.maxWidth = '24em';
		prTitle.title = prTitle.textContent!;
	}

	// Only show the native dropdown on medium and small screens #2597
	select('.js-diff-settings')!.closest('details')!.classList.add('d-lg-none');

	// Make space for the new button by removing "Changes from" #655
	select('[data-hotkey="c"] strong')!.previousSibling!.remove();

	// Remove extraneous padding around "Clear filters" button
	select('.subset-files-tab')?.classList.replace('px-sm-3', 'ml-sm-2');
}

function initCommitAndCompare(): false | void {
	select('#toc')!.prepend(
		<div className="float-right d-flex">
			<div className="d-flex ml-3 BtnGroup">{createDiffStyleToggle()}</div>
			<div className="d-flex ml-3 BtnGroup">{createWhitespaceButton()}</div>
		</div>,
	);

	// Remove previous options UI
	select('[data-ga-load^="Diff, view"]')!.remove();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit,
	],
	exclude: [
		pageDetect.isPRFile404,
	],
	shortcuts: {
		'd w': 'Show/hide whitespaces in diffs',
	},
	deduplicate: 'has-rgh-inner',
	init: initPR,
}, {
	include: [
		pageDetect.isSingleCommit,
		pageDetect.isCompare,
	],
	shortcuts: {
		'd w': 'Show/hide whitespaces in diffs',
	},
	init: initCommitAndCompare,
});
