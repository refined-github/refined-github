/*
If you select a line in a file, pressing ESC will deselect it.
*/

import features from '../libs/features';

function listener(event: KeyboardEvent) {
	if (
		event.key === 'Escape' && // Catch `Esc` key
		location.hash.startsWith('#L') && // If a line is selected
		!(event.target as Element).closest('textarea, input') // If a field isn’t focused
	) {
		location.hash = '#no-line'; // Update UI, without `scroll-to-top` behavior
		history.replaceState({}, document.title, location.pathname); // Drop remaining # from url
	}
}

function init() {
	document.body.addEventListener('keyup', listener);
}

features.add({
	id: 'esc-to-deselect-line',
	init
});
