import React from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/dom-utils';
import features from '../libs/features';

function init(): false | void {
	if (select.exists('.gh-header-meta a .State')) {
		return false;
	}

	// Get the latest status update
	const lastActionRef = select.all(`
		.discussion-item-closed,
		.discussion-item-reopened,
		.discussion-item-merged
	`).pop();

	// Leave if the issue/PR was never closed or if it was reopened
	if (!lastActionRef || lastActionRef.matches('.discussion-item-reopened')) {
		return false;
	}

	// Find reference to a commit/PR
	const lastActionLink = select('[href*="/pull/"], [href*="/commit/"], code', lastActionRef);

	const label = select('.gh-header-meta .State')!;

	if (lastActionLink) {
		const isMerged = lastActionLink.closest('.discussion-item-merged');
		label.append(isMerged ? ' as ' : ' in ', lastActionLink.cloneNode(true));
	}

	// Select the label inside the action ref and from there search an ID upwards
	const closestIdSelector = '#' + select('.discussion-item-header', lastActionRef)!.closest('[id]')!.id;

	// Link label to event in timeline
	wrap(label, <a href={closestIdSelector}/>);
}

features.add({
	id: 'extend-status-labels',
	include: [
		features.isPRConversation,
		features.isIssue
	],
	load: features.onNewComments,
	init
});
