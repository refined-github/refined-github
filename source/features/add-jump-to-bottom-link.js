import {h} from 'dom-chef';
import select from 'select-dom';

export default function () {
	const meta = select('.gh-header-meta > .TableObject-item--primary');
	if (!meta) {
		return;
	}

	meta.append(
		' · ',
		<a href="#partial-timeline-marker">Jump to bottom</a>
	);
}
