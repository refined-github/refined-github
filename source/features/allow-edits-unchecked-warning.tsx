import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';

function removeWarning() {
	const warning = select('#allow-edits-unchecked-warning');
	if (warning) {
		warning.remove();
	}
}

function init() {
	const checkBox = select<HTMLInputElement>('.js-collab-option');

	checkBox.addEventListener('change', () => {
		if (checkBox.checked) {
			return removeWarning();
		}

		select('.new-discussion-timeline .composer .timeline-comment').after(
			<div class="flash flash-error" id="allow-edits-unchecked-warning">
				<strong>Note:</strong> Disabling this would prevent the maintainer of this project from making vital changes to your branch.
			</div>
		);
	});
}

features.add({
	id: 'allow-edits-unchecked-warning',
	include: [
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
