import select from 'select-dom';

export default function () {
	for (const emoji of select.all('g-emoji')) {
		emoji.setAttribute('title', `:${emoji.getAttribute('alias')}:`);
	}
}
