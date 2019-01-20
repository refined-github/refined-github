import {React} from 'dom-chef/react';
import select from 'select-dom';
import {wrap} from '../libs/dom-utils';
import features from '../libs/features';

function init() {
	if (select.exists('.gh-header-meta a .State')) {
		return false;
	}

	const lastActionRef = select.all(`
		.discussion-item-closed [href*="/pull/"],
		.discussion-item-closed code,
		.discussion-item-reopened,
		.discussion-item-merged [href*="/commit/"]
	`).pop();

	// Leave if it was never closed or if it was reopened
	if (!lastActionRef || lastActionRef.matches('.discussion-item-reopened')) {
		return false;
	}

	const label = select('.gh-header-meta .State');
	const isMerged = lastActionRef.closest('.discussion-item-merged');
	label.append(isMerged ? ' as ' : ' in ', lastActionRef.cloneNode(true));

	// Link label to event in timeline
	wrap(label, <a href={'#' + lastActionRef.closest('[id]').id}></a>);
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
