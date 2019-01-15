/*
Hide other users starring/forking your repos
*/
import select from 'select-dom';
import features from '../libs/features';
import {getUsername, safeElementReady} from '../libs/utils';

const observer = new MutationObserver(([{addedNodes}]) => {
	// Remove events from dashboard
	for (const item of select.all('#dashboard .news .watch_started, #dashboard .news .fork')) {
		if (select(`a[href^="/${getUsername()}"]`, item)) {
			item.style.display = 'none';
		}
	}

	// Observe the new ajaxed-in containers
	for (const node of addedNodes) {
		if (node.tagName === 'DIV') {
			observer.observe(node, {childList: true});
		}
	}
});

async function init() {
	observer.observe(await safeElementReady('#dashboard .news'), {childList: true});
}

features.add({
	id: 'hide-own-stars',
	include: [
		features.isDashboard
	],
	init
});
