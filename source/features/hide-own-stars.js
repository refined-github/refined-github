// Hide other users starring/forking your repos

import select from 'select-dom';
import {getUsername} from '../libs/utils';

const observer = new MutationObserver(([{addedNodes}]) => {
	// Remove events
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

export default function () {
	observer.observe(select('#dashboard .news'), {childList: true});
}
