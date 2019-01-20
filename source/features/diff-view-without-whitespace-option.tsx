import {React} from 'dom-chef/react';
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

	const url = new URL(location.href);
	const hidingWhitespace = url.searchParams.get('w') === '1';

	if (hidingWhitespace) {
		url.searchParams.delete('w');
	} else {
		url.searchParams.set('w', '1');
	}

	container.after(
		<div class="diffbar-item refined-github-toggle-whitespace">
			<a href={url}
				data-hotkey="d w"
				class={`btn btn-sm btn-outline BtnGroup-item tooltipped tooltipped-s ${hidingWhitespace ? 'bg-gray-light text-gray-light' : ''}`}
				aria-label={`${hidingWhitespace ? 'Show' : 'Hide'} whitespace in diffs`}>
				{hidingWhitespace ? icons.check() : ''}
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
