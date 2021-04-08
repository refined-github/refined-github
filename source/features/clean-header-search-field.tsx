import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	(await elementReady<HTMLInputElement>('input.header-search-input'))!.value = '';
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversationList,
		pageDetect.isGlobalConversationList
	],
	awaitDomReady: false,
	init: onetime(init)
});
