import {registerShortcut} from './improve-shortcut-help';
import select from 'select-dom';

export default function () {
	registerShortcut('repos', 'g s', 'Star and unstar repository');
	let lastKey;
	document.addEventListener('keydown', (e) => {
		if ((lastKey === "g" && e.key === "s") || (e.key === "g" && lastKey === "s")) {
			let starButtonSelector = (select('div.js-social-container.starring-container').classList.contains('on')) ? 'form.starred.js-social-form > button' : 'form.unstarred.js-social-form > button';
			select(starButtonSelector).click();
		}
		lastKey = e.key;
	});
	document.addEventListener('keyup', () => {
		lastKey = null;
	})
}
