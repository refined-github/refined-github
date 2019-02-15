import select from 'select-dom';
import features from '../libs/features';

function init() {
	for (const emoji of select.all('g-emoji')) {
		// Don’t add a title if the emoji’s parents already have one #1097
		if (!emoji.closest('[title]')) {
			emoji.setAttribute('title', `:${emoji.getAttribute('alias')}:`);
		}
	}
}

features.add({
	id: 'emojis-title',
	load: features.onAjaxedPages,
	init
});
