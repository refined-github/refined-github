import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init() {
	const checkbox = select<HTMLInputElement>('.js-collab-option');
	const container = select('.new-discussion-timeline .composer .timeline-comment');
	const warning = (
		<div class="flash flash-error" id="allow-edits-unchecked-warning">
			<strong>Note:</strong> Disabling this would prevent a maintainer of this project from making vital changes to your branch.
		</div>
	);

	checkbox.addEventListener('change', () => {
		if (checkbox.checked) {
			warning.remove();
		} else {
			container.after(warning);
		}
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
