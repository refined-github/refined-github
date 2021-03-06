/** @jsx h */
import {h} from 'preact';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {BookIcon, CheckIcon, DiffIcon} from '@primer/octicons-react';

import render from '../helpers/render';

import features from '.';

function Link(props: AnyObject): h.JSX.Element {
	props.parameters.set('diff', props.type);
	return (
		<a
			className={`btn btn-sm BtnGroup-item tooltipped tooltipped-s ${props.selected ? 'selected' : ''}`}
			aria-label={`Show ${props.type} diffs`}
			href={`?${String(props.parameters)}`}
		>
			{props.children}
		</a>
	);
}
function createDiffStyleToggle(): h.JSX.Element {
	const parameters = new URLSearchParams(location.search);
	const isUnified = select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href$=unified]' // Link in single commit
	]);

	return (
		<>
			<Link type="unified" selected={isUnified} parameters={parameters}><DiffIcon/></Link>
			<Link type="split" selected={!isUnified} parameters={parameters}><BookIcon/></Link>
		</>
	);
}

function createWhitespaceButton(): h.JSX.Element {
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
			className={`btn btn-sm btn-outline tooltipped tooltipped-s ${isHidingWhitespace ? 'bg-gray-light text-gray-light color-text-tertiary' : ''}`}
			aria-label={`${isHidingWhitespace ? 'Show' : 'Hide'} whitespace in diffs`}
		>
			{isHidingWhitespace && <CheckIcon/>} No Whitespace
		</a>
	);
}

function wrap(...elements: Node[]): h.JSX.Element {
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
