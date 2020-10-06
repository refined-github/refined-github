import './warning-for-disallow-edits.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

const getWarning = onetime(() => (
	<div className="flash flash-error mt-3 rgh-warning-for-disallow-edits">
		<strong>Note:</strong> Maintainers may require changes. It’s easier and faster to allow them to make direct changes before merging.
	</div>
));

function update(checkbox: HTMLInputElement): void {
	if (checkbox.checked) {
		getWarning().remove();
	} else {
		checkbox
			.closest('.timeline-comment, .discussion-sidebar-item > .d-inline-flex')!
			.after(getWarning());
	}
}

function toggleHandler(event: delegate.Event<UIEvent, HTMLInputElement>): void {
	update(event.delegateTarget);
}

function init(): void | false {
	const checkbox = select<HTMLInputElement>('[name="collab_privs"]');
	if (!checkbox) {
		return false;
	}

	update(checkbox); // The sidebar checkbox may already be un-checked
	delegate(document, '[name="collab_privs"]', 'change', toggleHandler);
}

void features.add({
	id: __filebasename,
	description: 'Warns you when unchecking `Allow edits from maintainers`, as it’s maintainer-hostile.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/53151888-24101380-35ef-11e9-8d30-d6315ad97325.gif',
	testOn: ''
}, {
	include: [
		pageDetect.isCompare,
		pageDetect.isPRConversation
	],
	init
});
