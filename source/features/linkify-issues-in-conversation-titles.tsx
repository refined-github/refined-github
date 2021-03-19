import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as domFormatters from '../github-helpers/dom-formatters';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

function init(): void {
	for (const title of select.all('.js-issue-title')) {
		if (!select.exists('a', title)) {
			domFormatters.linkifyIssues(title);
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue
	],
	additionalListeners: [
		onConversationHeaderUpdate
	],
	init
});
