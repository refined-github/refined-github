import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';
import onNewsfeedLoad from '../libs/on-newsfeed-load';

async function init(): Promise<void> {
	for (const item of select.all('#dashboard .news .watch_started, #dashboard .news .fork')) {
		if (select.exists(`a[href^="/${getUsername()}"]`, item)) {
			item.style.display = 'none';
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Hides "starred" events for your own repos on the newsfeed.',
	screenshot: false
}, {
	include: [
		features.isDashboard
	],
	load: features.onDocumentStart,
	init: () => onNewsfeedLoad(init)
});
