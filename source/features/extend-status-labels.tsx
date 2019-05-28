import './extend-status-labels.css';
import React from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/dom-utils';
import features from '../libs/features';

function init(): false | void {
	if (select.exists('.gh-header-meta a .State')) {
		return false;
	}

	const lastStatusChange = select.last(`
		.discussion-item-closed,
		.discussion-item-reopened,
		.discussion-item-merged
	`);

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
	description: 'Add reference to PR/commit that closed the current issue/PR',
	screenshot: 'https://user-images.githubusercontent.com/1402241/35973522-5c00acb6-0d08-11e8-89ca-03071de15c6f.png',
	include: [
		features.isPRConversation,
		features.isIssue
	],
	load: features.onNewComments,
	init
});
