import './warning-for-disallow-edits.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const checkbox = select<HTMLInputElement>('[name="collab_privs"]');
	if (!checkbox) {
		return;
	}

	const warning = (
		<div className="flash flash-error mt-3 rgh-warning-for-disallow-edits">
			<strong>Note:</strong> Maintainers may require changes. It’s easier and faster to allow them to make direct changes before merging.
		</div>
	);
	const update = (): void => {
		if (checkbox.checked) {
			warning.remove();
		} else {
			// Select every time because the sidebar content may be replaced
			select(`
				.new-pr-form .timeline-comment,
				#partial-discussion-sidebar .js-collab-form + .js-dropdown-details
			`)!.after(warning);
		}
	};

	update(); // The sidebar checkbox may already be un-checked
	checkbox.addEventListener('change', update);
}

features.add({
	id: __featureName__,
	description: 'Warns you when unchecking `Allow edits from maintainers`, as it’s maintainer-hostile.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/53151888-24101380-35ef-11e9-8d30-d6315ad97325.gif',
	include: [
		features.isCompare,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
