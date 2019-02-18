import React from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';
import features from '../libs/features';

function init() {
	const container = select([
		'.table-of-contents.Details .BtnGroup', // In single commit view
		'.pr-review-tools > .diffbar-item' // In review view
	].join(','));

	if (!container) {
		return false;
	}

	const searchParams = new URLSearchParams(location.search);
	const isHidingWhitespace = searchParams.get('w') === '1';

	if (isHidingWhitespace) {
		searchParams.delete('w');
	} else {
		searchParams.set('w', '1');
	}

	container.after(
		<div class="diffbar-item refined-github-toggle-whitespace">
			<a href={`?${searchParams}`}
				data-hotkey="d w"
				class={`btn btn-sm btn-outline BtnGroup-item tooltipped tooltipped-s ${isHidingWhitespace ? 'bg-gray-light text-gray-light' : ''}`}
				aria-label={`${isHidingWhitespace ? 'Show' : 'Hide'} whitespace in diffs`}>
				{isHidingWhitespace ? icons.check() : ''}
				{' '}
				No Whitespace
			</a>
		</div>
	);

	// Make space for the new button by removing "Changes from" #655
	const uselessCopy = select('[data-hotkey="c"]');
	if (uselessCopy) {
		uselessCopy.firstChild.remove();
	}

	// Remove whitespace settings in Diff Settings dropdown
	const hideWhitespaceCheckbox = select('#whitespace-cb');
	// Remove header
	hideWhitespaceCheckbox.previousElementSibling.remove();
	// Remove checkbox label
	hideWhitespaceCheckbox.nextElementSibling.remove();
	// Remove checkbox
	hideWhitespaceCheckbox.remove();

	// Rename Diff Settings to Icon
	const diffSettings = select('.pr-review-tools .diffbar-item summary');
	diffSettings.innerText = '';
	diffSettings.append(<span class="data-menu-button">{icons.gear()}</span>);
	const dropdownMenu = diffSettings.nextElementSibling as HTMLElement;
	dropdownMenu.style.left = '-98px';
}

features.add({
	id: 'diff-view-without-whitespace-option',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	shortcuts: {
		'd w': 'Show/hide whitespaces in diffs'
	},
	init
});
