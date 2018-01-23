import {h} from 'dom-chef';
import select from 'select-dom';

export default function () {
	const meta = select('.gh-header-meta > .TableObject-item--primary');
	const jumpToBottomLink = select('#refined-github-jump-to-bottom-link');
	if (!meta || jumpToBottomLink) {
		return;
	}

	meta.append(
		' · ',
		<a href="#partial-timeline-marker" id="refined-github-jump-to-bottom-link">Jump to bottom</a>
	);
}
