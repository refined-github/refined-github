import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';

function redirectToIssues(event: DelegateEvent<Event, HTMLFormElement>): void {
	event.preventDefault();

	const form = event.delegateTarget;
	const searchValue = form.elements['js-issues-search'].value;
	let redirect = true;

	if (searchValue) {
		const searchQuery = new SearchQuery(searchValue);
		if (searchQuery.includes('is:pr')) {
			redirect = false
		}
	}

	if (redirect) {
		form.action = form.action.replace(/\/pulls$/, '/issues');
		form.submit();
	}
}

function init(signal: AbortSignal): void {
	delegate('form.subnav-search[action$="/pulls"]', 'submit', redirectToIssues, {
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

1. Open https://github.com/refined-github/refined-github/pulls
2. Remove the "is:pr" from the search input and submit
3. You should be redirected to the "Issues" tab

*/
