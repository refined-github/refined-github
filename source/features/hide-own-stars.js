import select from 'select-dom';
import observeEl from '../libs/simplified-element-observer';
import {getUsername} from '../libs/utils';

// Hide other users starring/forking your repos
export default function () {
	const username = getUsername();
	observeEl('#dashboard .news', () => {
		for (const item of select.all('#dashboard .news .watch_started, #dashboard .news .fork')) {
			if (select(`a[href^="/${username}"]`, item)) {
				item.style.display = 'none';
			}
		}
	});
}
