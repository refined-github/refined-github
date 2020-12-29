import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	$('.subnav-search')!.setAttribute('autocomplete', 'off');
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversationList
	],
	init
});
