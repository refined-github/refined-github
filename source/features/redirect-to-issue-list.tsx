import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function redirectToIssues(event: DelegateEvent<Event, HTMLFormElement>): void {
	event.preventDefault();

	const form = event.delegateTarget;
	const searchInput = form.elements['js-issues-search'];

	if (!searchInput.value.includes('is:pr')) {
		form.action = form.action.replace(/\/pulls$/, '/issues');
	}

	form.submit();
}

function init(signal: AbortSignal): void {
	delegate('form.subnav-search', 'submit', redirectToIssues, {
		signal,
		capture: true,
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoPRList,
	],
	init,
});

/*

Test URLs:

1. Open https://github.com/refined-github/refined-github/pulls?q=search+sort%3Aupdated-desc
2. Remove the "is:pr" from the search input and submit
3. You should be redirected to the "Issues" tab

*/
