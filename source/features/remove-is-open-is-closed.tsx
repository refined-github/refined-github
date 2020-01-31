import React from 'dom-chef';
import select from 'select-dom';
// import delegate, { DelegateSubscription } from 'delegate-it';
import delegate from 'delegate-it';
import features from '../libs/features';

let delegate_temporary: any;
function log() {
	console.log('Init remove-is-open-is-closed feature');
}

const count = (str:String, re:RegExp) => {
  // const re = /[a-z]{3}/g
  return ((str || '').match(re) || []).length
}

function init(): void {
	// Events must be set via delegate, unless shortlived
	delegate_temporary = delegate('.btn', 'click', log);
	log();
	const currentQuery = new URLSearchParams(location.search).get('q') ?? select<HTMLInputElement>('#js-issues-search').value;
	var linkMergedSearchString = new URLSearchParams(location.search).get('q') ?? select<HTMLInputElement>('#js-issues-search').value;
	const linkMergedSearchParams = new URLSearchParams(location.search)//.get('q')// ?? select('#js-issues-search').value;
	const linkIsMerged:HTMLAnchorElement = <a href="" className="btn-link">
	{/* const linkIsMerged:HTMLElement = <a href="" className="btn-link"> */}
		{/* <svg className="octicon octicon-check" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg> */}
		{/* 2,634 Merged */}
		Merged
	</a>
	const regexp_query_total = /is:open|is:closed|is:issue/g
	const regexp_query = /is:open|is:closed|is:issue/
	// console.log(count(linkMergedSearchString, /is:open|is:closed|is:issue/g))
	console.log(count(linkMergedSearchString, regexp_query_total))
	/*
	 *	currentQuery.replace(/is:open|is:closed|is:issue/, 'is:merged')
	 *	"is:merged is:open "
	 *	currentQuery
	 *	"is:issue is:open "
	 */
	while (count(linkMergedSearchString, regexp_query_total) > 1) {
		console.log("ITERACION")
		console.log(linkMergedSearchString)
		linkMergedSearchString = linkMergedSearchString.replace(regexp_query, '').trim()
	}
	console.log("END")

	linkMergedSearchParams.set('q', linkMergedSearchString.replace(regexp_query, 'is:merged').trim())
	linkIsMerged.search = String(linkMergedSearchParams) // "/sindresorhus/refined-github/issues?q=is%3Amerged"
	// linkIsMerged.search = "q=is%3Amerged" // "/sindresorhus/refined-github/issues?q=is%3Amerged"
	// linkIsMerged.search = "is:merged" // "/sindresorhus/refined-github/issues?q=is%3Amerged"
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
		// debugger
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

function deinit(): void {
	delegate_temporary?.destroy();
	delegate_temporary = undefined;
}

features.add({
	id: __featureName__,
	description: 'Simplify the GitHub interface and adds useful features',
	screenshot: 'https://user-images.githubusercontent.com/1402241/58238638-3cbcd080-7d7a-11e9-80f6-be6c0520cfed.jpg',
	shortcuts: { // This only adds the shortcut to the help screen, it doesn't enable it
		'↑': 'Edit your last comment'
	},
	include: [
		features.isRepo
	],
	exclude: [
		features.isOwnUserProfile
	],
	load: features.onDomReady, // Wait for DOM ready
	// load: features.onAjaxedPages, // Or: Wait for DOM ready AND run on all AJAXed loads
	// load: features.onNewComments, // Or: Wait for DOM ready AND run on all AJAXed loads AND watch for new comments
	deinit, // Rarely needed
	init
});
