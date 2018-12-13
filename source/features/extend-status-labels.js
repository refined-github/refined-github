import {h} from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/utils';
import onNewComments from '../libs/on-new-comments';

function addLink() {
	if (select.exists('.gh-header-meta a .State')) {
		return;
	}

	const lastActionRef = select.all(`
		.discussion-item-closed [href*="/pull/"],
		.discussion-item-closed code,
		.discussion-item-reopened,
		.discussion-item-merged [href*="/commit/"]
	`).pop();

	// Leave if it was never closed or if it was reopened
	if (!lastActionRef || lastActionRef.matches('.discussion-item-reopened')) {
		return;
	}

	const label = select('.gh-header-meta .State');
	const isMerged = lastActionRef.closest('.discussion-item-merged');
	label.append(isMerged ? ' as ' : ' in ', lastActionRef.cloneNode(true));

	// Link label to event in timeline
	wrap(label, <a href={'#' + lastActionRef.closest('[id]').id}></a>);
}

export default function () {
	addLink();
	onNewComments(addLink);
}
