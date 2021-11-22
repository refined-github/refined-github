import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	select('.subnav-search')!.setAttribute('autocomplete', 'off');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversationList,
	],
	exclude: [
		pageDetect.isMilestone,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
