import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onNewComments from '../github-events/on-new-comments';

function init(): void {
	if (select.exists('#partial-discussion-header span[title="Status: Draft"]')) {
		const commentButton = select('#partial-new-comment-form-actions > div > div.color-bg-secondary.ml-1 > button');
		commentButton!.innerHTML = 'Comment to Draft PR';
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	additionalListeners: [
		onNewComments
	],
	init
});
