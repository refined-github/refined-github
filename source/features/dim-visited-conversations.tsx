import './dim-visited-conversations.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	document.body.classList.add('rgh-dim-visited-conversations');

	for (const row of select.all('.js-issue-row')) {
		const count = select('.octicon-comment + .text-small', row)?.textContent;

		if (count) {
			select('a.Link--primary', row)!.hash = 'rgh-dim-visited-conversations-' + count;
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversationList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
