import {h} from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/utils';

export default function () {
	const lastAction = select.all(`
		.discussion-item-closed,
		.discussion-item-reopened
	`).pop();

	if (!lastAction) {
		return;
	}

	// Get PR or commits reference
	const refEl = select(`
		[href*="/pull/"],
		code
	`, lastAction);

	if (!refEl) {
		return;
	}

	// Add extra info
	const label = select('.gh-header-meta .State');
	label.append(' in ', refEl.cloneNode(true));

	// Link label to event in timeline
	const fragment = select('.discussion-item-header[id]', lastAction).id;
	wrap(label, <a href={'#' + fragment}></a>);
}
