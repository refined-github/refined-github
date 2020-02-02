import React from 'dom-chef';
import select from 'select-dom';
import checkIcon from 'octicon/check.svg';
import features from '../libs/features';

function addMergeLink(): void {
	if (!features.isPRList()) {
		return;
	}

	const lastLink = select<HTMLAnchorElement>('.table-list-header-toggle > :last-child')!;

	// In this case, it's a "Total" link, which appears if the query includes "is:merged".
	// This means that the link itself is showing the number of merged issues, so it can be renamed to "Merged".
	if (!lastLink.search.includes('is%3Aclosed')) {
		lastLink.lastChild!.textContent = lastLink.lastChild!.textContent!.replace('Total', 'Merged');
		return;
	}

	// In this case, `lastLink` is expected to be a "Closed" link
	const mergeLink = lastLink.cloneNode(true);
	mergeLink.textContent = 'Merged';
	mergeLink.search = mergeLink.search.replace('is%3Aclosed', 'is%3Amerged');
	mergeLink.classList.toggle('selected', location.search.includes('is%3Amerged'));
	lastLink.after(' ', mergeLink);
}


function togglableFilters(divTableListFiltersParent): void {
	const targetButtons = select.all('.btn-link', divTableListFiltersParent);
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
}

function init(): void {
	const divTableListFiltersParent = select('.table-list-header-toggle.states');
	togglableFilters(divTableListFiltersParent);
	addMergeLink();
}

features.add({
	id: __featureName__,
	description: 'Lets you toggle between is:open/is:closed/is:merged filters in searches.',
	screenshot: 'https://user-images.githubusercontent.com/3003032/73557979-02d7ba00-4431-11ea-90da-5e9e37688d61.png',
	include: [
		features.isDiscussionList
	],
	init
});
