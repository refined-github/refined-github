import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init() {
	const checkbox = select<HTMLInputElement>('input[type="checkbox"][class^="js-collab"]');
	const container = select('.new-discussion-timeline .composer .timeline-comment') ||
		select('.discussion-sidebar>.text-small');
	const warning = (
		<div class="flash flash-error" id="allow-edits-unchecked-warning">
			<strong>Note:</strong> Maintainers may require changes. It’s easier and faster to allow them to make direct changes before merging.
		</div>
	);
	const update = () => {
		if (checkbox.checked) {
			warning.remove();
		} else {
			container.after(warning);
		}
	};

	update(); // The sidebar checkbox may already be un-checked
	checkbox.addEventListener('change', update);
}

features.add({
	id: 'warning-for-disallow-edits',
	include: [
		features.isCompare,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
