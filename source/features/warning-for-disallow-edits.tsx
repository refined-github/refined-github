import './warning-for-disallow-edits.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

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

function toggleHandler(event: DelegateEvent<Event, HTMLInputElement>): void {
	update(event.delegateTarget);
}

function init(signal: AbortSignal): void | false {
	const checkbox = select('input[name="collab_privs"]');
	if (!checkbox) {
		return false;
	}

	update(checkbox); // The sidebar checkbox may already be un-checked
	delegate(document, 'input[name="collab_privs"]', 'change', toggleHandler, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
		pageDetect.isPRConversation,
	],
	// No need to exclude `isClosedConversation` as the checkbox won't be present
	deduplicate: 'has-rgh-inner',
	init,
});
