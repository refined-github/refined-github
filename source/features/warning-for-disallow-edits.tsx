import './warning-for-disallow-edits.css';
import React from 'dom-chef';
import select from 'select-dom';
import oneTime from 'onetime';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

const getWarning = oneTime(() => (
	<div className="flash flash-error mt-3 rgh-warning-for-disallow-edits">
		<strong>Note:</strong> Maintainers may require changes. It’s easier and faster to allow them to make direct changes before merging.
	</div>
));

function update(checkbox: HTMLInputElement): void {
	if (checkbox.checked) {
		getWarning().remove();
	} else {
		// Select every time because the sidebar content may be replaced
		select(`
				.new-pr-form .timeline-comment,
				#partial-discussion-sidebar .js-collab-form + .js-dropdown-details
			`)!.after(getWarning());
	}
}

function toggleHandler(event: delegate.Event<UIEvent, HTMLInputElement>): void {
	update(event.delegateTarget);
}

function init(): void {
	const checkbox = select<HTMLInputElement>('[name="collab_privs"]');
	if (!checkbox) {
		return;
	}

	update(checkbox); // The sidebar checkbox may already be un-checked
	delegate(document, '[name="collab_privs"]', 'change', toggleHandler);
}

features.add({
	id: __filebasename,
	description: 'Warns you when unchecking `Allow edits from maintainers`, as it’s maintainer-hostile.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/53151888-24101380-35ef-11e9-8d30-d6315ad97325.gif'
}, {
	include: [
		pageDetect.isCompare,
		pageDetect.isPRConversation
	],
	init
});
