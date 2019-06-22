import select from 'select-dom';
import elementReady from 'element-ready';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

const observer = new MutationObserver(([{addedNodes}]) => {
	// Remove events from dashboard
	for (const item of select.all('#dashboard .news .watch_started, #dashboard .news .fork')) {
		if (select.exists(`a[href^="/${getUsername()}"]`, item)) {
			item.style.display = 'none';
		}
	}

	// Observe the new ajaxed-in containers
	for (const node of addedNodes) {
		if (node instanceof HTMLDivElement) {
			observer.observe(node, {childList: true});
		}
	}
});

async function init(): Promise<void> {
	observer.observe((await elementReady('#dashboard .news'))!, {childList: true});
}

features.add({
	id: __featureName__,
	description: 'Hide other users starring/forking your repos in the dashboard',
	include: [
		features.isDashboard
	],
	init
});
