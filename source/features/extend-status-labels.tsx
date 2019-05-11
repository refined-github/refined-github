import './extend-status-labels.css';
import React from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/dom-utils';
import features from '../libs/features';

function init(): false | void {
	if (select.exists('.gh-header-meta a .State')) {
		return false;
	}

	const lastStatusChange = select.all(`
		.discussion-item-closed,
		.discussion-item-reopened,
		.discussion-item-merged
	`).pop();

	// Leave if the issue/PR was never closed or if it was reopened
	if (!lastStatusChange || lastStatusChange.matches('.discussion-item-reopened')) {
		return false;
	}

	const label = select('.gh-header-meta .State')!;
	const lastActionLink = select('[href*="/pull/"], [href*="/commit/"], code', lastStatusChange);

	if (lastActionLink) {
		const isMerged = lastStatusChange.matches('.discussion-item-merged');
		label.append(isMerged ? ' as ' : ' in ', lastActionLink.cloneNode(true));
	}

	// Link label to event in timeline
	wrap(label, <a href={'#' + select('[id]', lastStatusChange)!.id}/>);
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
