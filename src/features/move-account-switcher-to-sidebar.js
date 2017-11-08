import select from 'select-dom';
import {safeElementReady} from '../libs/utils';

export default function () {
	safeElementReady('.dashboard-sidebar').then(sidebar => {
		const switcher = select('.account-switcher');
		if (sidebar && switcher) {
			sidebar.prepend(switcher);
		}
	});
}

