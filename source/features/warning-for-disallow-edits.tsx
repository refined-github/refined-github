import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init() {
	const checkbox = select<HTMLInputElement>('.js-collab-option');
	const container = select('.new-discussion-timeline .composer .timeline-comment');
	const warning = (
		<div class="flash flash-error" id="allow-edits-unchecked-warning">
			<strong>Note:</strong> Maintainers may require changes. It’s easier and faster to allow them to make direct changes before merging.
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
