import select from 'select-dom';
import {registerShortcut} from './improve-shortcut-help';

export default function () {
	registerShortcut('site', 'shift o', 'Open selection in new tab');

	document.addEventListener('keypress', event => {
		const selected = document.querySelector('.navigation-focus .js-navigation-open[href]');
		if (selected && event.key === 'O') {
			window.open(selected, '_blank');
		}
	});
}
