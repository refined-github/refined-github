import {h} from 'dom-chef';
import select from 'select-dom';
import observeEl from '../libs/simplified-element-observer';

function add() {
	const meta = select('.gh-header-meta > .TableObject-item--primary');
	const jumpToBottomLink = select('#rgh-jump-to-bottom-link');
	if (!meta || jumpToBottomLink) {
		return;
	}

	meta.append(
		' · ',
		<a href="#partial-timeline" id="rgh-jump-to-bottom-link">Jump to bottom</a>
	);
}

export default function () {
	// The issue header changes when new comments are added or the issue status changes
	observeEl('.js-issues-results', add);
}
