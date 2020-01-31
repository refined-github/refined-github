import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

const count = (str:String, re:RegExp) => {
  return ((str || '').match(re) || []).length
}

function init(): void {
	// Events must be set via delegate, unless shortlived
	const currentQuery = new URLSearchParams(location.search).get('q') ?? select<HTMLInputElement>('#js-issues-search').value;

	const linkMergedSearchParams = new URLSearchParams(location.search)//.get('q')// ?? select('#js-issues-search').value;
	const linkIsMerged:HTMLAnchorElement = <a href="" className="btn-link">
		{/* <svg className="octicon octicon-check" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg> */}
		Merged
	</a>
	const regexp_query_total = /is:open|is:closed|is:issue/g
	const regexp_query = /is:open|is:closed|is:issue/

	var linkMergedSearchString = new URLSearchParams(location.search).get('q') ?? select<HTMLInputElement>('#js-issues-search').value;

	while (count(linkMergedSearchString, regexp_query_total) > 1) {
		linkMergedSearchString = linkMergedSearchString.replace(regexp_query, '').trim()
	}

	if (count(linkMergedSearchString, /is:merged/) == 1) {
		linkMergedSearchParams.set('q', linkMergedSearchString.replace(/is:merged/, '').trim())
	} else if (count(linkMergedSearchString, regexp_query_total) == 1) {
		linkMergedSearchParams.set('q', linkMergedSearchString.replace(regexp_query, 'is:merged').trim())
	}
	linkIsMerged.search = String(linkMergedSearchParams) // "/sindresorhus/refined-github/issues?q=is%3Amerged"

	const container_target_buttons = select('div.table-list-filters').children[0].children[0];
	const target_buttons = container_target_buttons.children;
	for (const link of target_buttons) {
		link.firstElementChild.remove();
		if (link.classList.contains('selected')) {
			link.prepend(<svg className="octicon octicon-check" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true">
				<path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"/>
			</svg>);
		}

		const linkSearchParameters = new URLSearchParams(link.search);
		const linkQuery = linkSearchParameters.get('q');
		if (linkQuery === currentQuery) {
			linkSearchParameters.set('q', linkQuery.replace(/is:open|is:closed/, '').trim());
			console.log("ACHTUNG")
			console.log(linkSearchParameters)
			link.search = String(linkSearchParameters);
			// return; // The next link won't match this condition for sure
		}
	}

	container_target_buttons.append(linkIsMerged);
}

features.add({
	id: __featureName__,
	description: 'Remove is:open/is:closed issue search query with a click, add Merged link button next to them',
	screenshot: 'https://user-images.githubusercontent.com/3003032/73557979-02d7ba00-4431-11ea-90da-5e9e37688d61.png',
	include: [
		features.isRepo
	],
	exclude: [
		features.isOwnUserProfile
	],
	load: features.onDomReady, // Wait for DOM ready
	// load: features.onAjaxedPages, // Or: Wait for DOM ready AND run on all AJAXed loads
	// load: features.onNewComments, // Or: Wait for DOM ready AND run on all AJAXed loads AND watch for new comments
	init
});
