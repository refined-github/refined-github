import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';

function add() {
	const meta = select('.gh-header-meta > .TableObject-item--primary');
	if (!meta || select.exists('#rgh-jump-to-bottom-link')) {
		return false;
	}

	meta.append(
		' · ',
		<a href="#partial-timeline" id="rgh-jump-to-bottom-link">Jump to bottom</a>
	);
}

function init() {
	// The issue header changes when new comments are added or the issue status changes
	observeEl('.js-issues-results', add);
}

features.add({
	id: 'jump-to-bottom-link',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
