import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';
import {registerShortcut} from './improve-shortcut-help';

export default function () {
	const container = select([
		'.table-of-contents.Details .BtnGroup', // In single commit view
		'.pr-review-tools > .diffbar-item' // In review view
	].join(','));

	if (!container) {
		return;
	}

	const url = new URL(location.href);
	const hidingWhitespace = url.searchParams.get('w') === '1';

	if (hidingWhitespace) {
		url.searchParams.delete('w');
	} else {
		url.searchParams.set('w', 1);
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
	registerShortcut('source', 'd w', 'Show/hide whitespaces in diffs');

	// Make space for the new button by removing "Changes from" #655
	const uselessCopy = select('[data-hotkey="c"]');
	if (uselessCopy) {
		uselessCopy.firstChild.remove();
	}
}
