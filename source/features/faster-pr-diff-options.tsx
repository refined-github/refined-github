import React from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';
import features from '../libs/features';

function createDiffStyleToggle() {
	const params = new URLSearchParams(location.search);
	const isUnified = select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href$=unified]' // Link in single commit
	].join());

	const makeLink = (type: string, icon: Element, selected: boolean) => {
		params.set('diff', type);
		return <a
			className={`btn btn-sm BtnGroup-item tooltipped tooltipped-s ${selected ? 'selected' : ''}`}
			aria-label={`Show ${type} diffs`}
			href={`?${params}`}>
			{icon}
		</a>;
	};

	return <>
		{makeLink('unified', icons.diff(), isUnified)}
		{makeLink('split', icons.book(), !isUnified)}
	</>;
}

function createWhitespaceButton() {
	const searchParams = new URLSearchParams(location.search);
	const isHidingWhitespace = searchParams.get('w') === '1';

	if (isHidingWhitespace) {
		searchParams.delete('w');
	} else {
		searchParams.set('w', '1');
	}

	return (
		<a href={`?${searchParams}`}
			data-hotkey="d w"
			className={`btn btn-sm btn-outline tooltipped tooltipped-s ${isHidingWhitespace ? 'bg-gray-light text-gray-light' : ''}`}
			aria-label={`${isHidingWhitespace ? 'Show' : 'Hide'} whitespace in diffs`}>
			{isHidingWhitespace ? icons.check() : false} No Whitespace
		</a>
	);
}

function wrap(...elements: Element[]) {
	if (features.isSingleCommit()) {
		return <div className="float-right">
			{...elements.map(element => <div className="ml-3 BtnGroup">{element}</div>)}
		</div>;
	}

	return <>{elements.map(element => <div className="diffbar-item">{element}</div>)}</>;
}

function init(): false | void {
	const container = select([
		'.table-of-contents.Details .BtnGroup', // In single commit view
		'.pr-review-tools > .diffbar-item' // In review view
	].join(','));

	if (!container) {
		return false;
	}

	container.replaceWith(
		wrap(
			createDiffStyleToggle(),
			createWhitespaceButton()
		)
	);

	// Make space for the new button by removing "Changes from" #655
	const uselessCopy = select('[data-hotkey="c"]');
	if (uselessCopy) {
		uselessCopy.firstChild!.remove();
	}
}

features.add({
	id: 'faster-pr-diff-options',
	include: [
		features.isPRFiles,
		features.isCommit
	],
	load: features.onAjaxedPages,
	shortcuts: {
		'd w': 'Show/hide whitespaces in diffs'
	},
	init
});
