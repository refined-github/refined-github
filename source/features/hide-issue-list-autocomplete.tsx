import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	select('.subnav-search')!.setAttribute('autocomplete', 'off');
}

void features.add({
	id: __filebasename,
	description: 'Removes the autocomplete on search fields.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/42991841-1f057e4e-8c07-11e8-909c-b051db7a2a03.png'
}, {
	include: [
		pageDetect.isConversationList
	],
	init
});
