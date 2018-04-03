import select from 'select-dom';
import {registerShortcut} from './improve-shortcut-help';

export default function () {
	registerShortcut('notifications', 'shift o', 'Open Selected Notification in New Tab');

	document.addEventListener('keyup', event => {
		const notification = select('.js-notification, .navigation-focus');
		const url = document.querySelector('.navigation-focus a');

		if (notification && event.key === 'O') {
			window.open(url, '_blank');
		}
	});
}
