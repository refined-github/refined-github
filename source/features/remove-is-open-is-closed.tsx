import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import checkIcon from 'octicon/check.svg';

const countMatches = (string: string, regex: RegExp): number => {
	return ((string || '').match(regex) ?? []).length;
};

function createMergeLink(linkIsMerged:HTMLAnchorElement): HTMLAnchorElement {
	const linkMergedSearchParameters = new URLSearchParams(location.search);
	linkIsMerged.textContent = "Merged";
	const regexpQueryTotal = /is:open|is:closed|is:issue/g;
	const regexpQuery = /is:open|is:closed|is:issue/;

	let linkMergedSearchString = new URLSearchParams(location.search).get('q') ?? select<HTMLInputElement>('#js-issues-search')!.value;

	while (countMatches(linkMergedSearchString, regexpQueryTotal) > 1) {
		linkMergedSearchString = linkMergedSearchString.replace(regexpQuery, '').trim();
	}

	if (countMatches(linkMergedSearchString, /is:merged/) === 1) {
		linkMergedSearchParameters.set('q', linkMergedSearchString.replace(/is:merged/, 'is:issue').trim());
		linkIsMerged.classList.add('selected');
	} else if (countMatches(linkMergedSearchString, regexpQueryTotal) === 1) {
		linkMergedSearchParameters.set('q', linkMergedSearchString.replace(regexpQuery, 'is:merged').trim());
	}

	linkIsMerged.search = String(linkMergedSearchParameters);

	return linkIsMerged;
}

function init(): void {
	const divTableListFiltersParent = select('.table-list-header-toggle.states');
	const inputJsIssuesSearch = select<HTMLInputElement>('#js-issues-search');
	if ((divTableListFiltersParent === null) || (inputJsIssuesSearch === null)) {
		return;
	}

	const linkFilters = select.all('.btn-link', divTableListFiltersParent)

	// select.all('.btn-link', divTableListFiltersParent).map(element => console.log(element.classList))
	// const closedLink = linkFilters.filter(element => element.innerText.includes('Closed'))[0]
	const selectedLink = linkFilters.filter(element => element.classList.contains('selected'))[0]
	let mergeLink
	if (typeof selectedLink === 'undefined') {
		mergeLink = createMergeLink(linkFilters[0].cloneNode(true), 'is:open')
	} else if (selectedLink.innerText.includes('Closed')) {
		mergeLink = createMergeLink(linkFilters.filter(element => element.innerText.includes('Open'))[0].cloneNode(true))
	} else if (selectedLink.innerText.includes('Open')) {
		mergeLink = createMergeLink(linkFilters.filter(element => element.innerText.includes('Closed'))[0].cloneNode(true))
	} else if (selectedLink.innerText.includes('Total')) {
		mergeLink = createMergeLink(linkFilters.filter(element => element.innerText.includes('Total'))[0].cloneNode(true))
	}

	const targetButtons = select.all('.btn-link', divTableListFiltersParent)
	for (const link of targetButtons) {
		select('.octicon', link)!.remove();
		if (link.classList.contains('selected')) {
			link.prepend(<>{checkIcon()}</>);
			const linkSearchParameters = new URLSearchParams(link.search);
			const linkQuery = linkSearchParameters.get('q');
			linkSearchParameters.set('q', linkQuery!.replace(/is:open|is:closed/, '').trim());
			link.search = String(linkSearchParameters);
		}
	}

	divTableListFiltersParent.append(mergeLink)
}

features.add({
	id: __featureName__,
	description: 'Remove is:open/is:closed issue search query with a click, add Merged link button next to them.',
	screenshot: 'https://user-images.githubusercontent.com/3003032/73557979-02d7ba00-4431-11ea-90da-5e9e37688d61.png',
	include: [
		features.isRepoIssueList
	],
	exclude: [
		features.isOwnUserProfile
	],
	load: features.onDomReady,
	init
});
