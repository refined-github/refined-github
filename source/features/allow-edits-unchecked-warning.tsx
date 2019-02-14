import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init() {
	const checkbox = select<HTMLInputElement>('.js-collab-option');

	checkbox.addEventListener('change', () => {
		if (checkbox.checked) {
			const warning = select('#allow-edits-unchecked-warning');
			if (warning) {
				warning.remove();
			}

			return;
		}

		select('.new-discussion-timeline .composer .timeline-comment').after(
			<div class="flash flash-error" id="allow-edits-unchecked-warning">
				<strong>Note:</strong> Disabling this would prevent a maintainer of this project from making vital changes to your branch.
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
