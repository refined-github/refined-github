import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import {getUsername} from '../libs/utils';

// Hide other users starring/forking your repos
function init() {
	const username = getUsername();
	observeEl('#dashboard .news', () => {
		for (const item of select.all('#dashboard .news .watch_started, #dashboard .news .fork')) {
			if (select(`a[href^="/${username}"]`, item)) {
				item.style.display = 'none';
			}
		}
	});
}

features.add({
	id: 'hide-own-stars',
	include: [
		features.isDashboard
	],
	load: features.onDomReady,
	init
});
