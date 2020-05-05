import React from 'dom-chef';
import select from 'select-dom';
import DiffIcon from 'octicon/diff.svg';
import BookIcon from 'octicon/book.svg';
import CheckIcon from 'octicon/check.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

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
				className={`btn btn-sm BtnGroup-item tooltipped tooltipped-s ${selected ? 'selected' : ''}`}
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
			className={`btn btn-sm btn-outline tooltipped tooltipped-s ${isHidingWhitespace ? 'bg-gray-light text-gray-light' : ''}`}
			aria-label={`${isHidingWhitespace ? 'Show' : 'Hide'} whitespace in diffs`}
		>
			{isHidingWhitespace && <CheckIcon/>} No Whitespace
		</a>
	);
}

function wrap(...elements: Node[]): DocumentFragment {
	if (pageDetect.isSingleCommit()) {
		return (
			<div className="float-right">
				{elements.map(element => <div className="ml-3 BtnGroup">{element}</div>)}
			</div>
		);
	}

	// eslint-disable-next-line react/jsx-no-useless-fragment
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

features.add({
	id: __filebasename,
	description: 'Adds one-click buttons to change diff style and to ignore the whitespace and a keyboard shortcut to ignore the whitespace: `d` `w`.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54178764-d1c96080-44d1-11e9-889c-734ffd2a602d.png',
	shortcuts: {
		'd w': 'Show/hide whitespaces in diffs'
	}
}, {
	include: [
		// Disabled because of #2291 // pageDetect.isPRFiles
		pageDetect.isCommit
	],
	init
});
