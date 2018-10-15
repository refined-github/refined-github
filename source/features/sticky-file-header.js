import select from 'select-dom';

const className = 'rgh-sticky-file-header';

export default function () {
	const fileHeaderSelectors = `
		.file .file-header,
		.issues-listing .table-list-header,
		.pull-request-tab-content .diff-view .file-header
	`;

	for (const el of select.all(fileHeaderSelectors)) {
		el.classList.add(className);
	}

	// Flipping all tooltips inside all .file-header to their opposite direction
	// to prevent them from cutting off.
	for (const el of select.all(`.${className} [class*=tooltipped-n]`)) {
		// Replace the direction suffix from north to south
		// example: -n → -s, -nw → -sw, or -ne → -se
		el.className = el.className.replace('tooltipped-n', 'tooltipped-s');
	}
}
