import {h} from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/utils';

export default function () {
	const lastActionRef = select.all(`
		.discussion-item-closed [href*="/pull/"],
		.discussion-item-closed code,
		.discussion-item-reopended
	`).pop();

	// Leave if it was never closed or if it was reopened or if it’s already linked
	if (!lastActionRef || lastActionRef.matches('.discussion-item-reopended') || select.exists('.gh-header-meta .State a')) {
		return;
	}

	// Add extra info
	const label = select('.gh-header-meta .State');
	label.append(' in ', lastActionRef.cloneNode(true));

	// Link label to event in timeline
	wrap(label, <a href={'#' + lastActionRef.closest('[id]').id}></a>);
}
