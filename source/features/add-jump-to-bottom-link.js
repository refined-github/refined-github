import {h} from 'dom-chef';
import select from 'select-dom';

export default function () {
	const meta = select('.gh-header-meta > .TableObject-item--primary');
	if (!meta) {
		return;
	}

	meta.appendChild(<span> · </span>);
	meta.appendChild(<a href="#partial-timeline-marker">Jump to bottom</a>);
}
