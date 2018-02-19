import select from 'select-dom';

export default function () {
	for (const emoji of select.all('g-emoji')) {
		// Don’t add a title if the emoji’s parents already have one #1097
		if (!emoji.closest('[title]')) {
			emoji.setAttribute('title', `:${emoji.getAttribute('alias')}:`);
		}
	}
}
