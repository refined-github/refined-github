import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';

function init(): void {
	select('.subnav-search')!.setAttribute('autocomplete', 'off');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	exclude: [
		pageDetect.isMilestone,
	],
	awaitDomReady: true, // Not urgent
	init,
});
