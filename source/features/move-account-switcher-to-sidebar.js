import select from 'select-dom';
import {safeElementReady} from '../libs/utils';

export default async function () {
	const sidebar = await safeElementReady('.dashboard-sidebar');
	const switcher = select('.account-switcher');
	if (sidebar && switcher) {
		sidebar.prepend(switcher);
	}
}
