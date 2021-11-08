import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	(await elementReady('input.header-search-input'))!.value = '';
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversationList,
		pageDetect.isGlobalConversationList,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init: onetime(init),
});
