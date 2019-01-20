import select from 'select-dom';
import features from '../libs/features';

function init() {
	document.documentElement.classList.add('rgh-sticky-header');

	// Flipping all tooltips inside all .file-header to their opposite direction
	// to prevent them from cutting off.
	for (const el of select.all('.file-header [class*=tooltipped-n]')) {
		// Replace the direction suffix from north to south
		// example: -n → -s, -nw → -sw, or -ne → -se
		el.className = el.className.replace('tooltipped-n', 'tooltipped-s');
	}
}

features.add({
	id: 'make-headers-sticky',
	include: [
		// TODO: limit to fewer views
	],
	load: features.onAjaxedPages,
	init
});
