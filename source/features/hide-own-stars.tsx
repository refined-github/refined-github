import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getUsername} from '../libs/utils';

async function init(): Promise<void> {
	for (const item of select.all('#dashboard .news .watch_started, #dashboard .news .fork')) {
		if (select.exists(`a[href^="/${getUsername()}"]`, item)) {
			item.style.display = 'none';
		}
	}
}

features.add({
	id: __filebasename,
	description: 'Hides "starred" events for your own repos on the newsfeed.',
	screenshot: false
}, {
	include: [
		pageDetect.isDashboard
	],
	onlyAdditionalListeners: true,
	repeatOnAjax: false,
	init
});
