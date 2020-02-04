import select from 'select-dom';
import checkIcon from 'octicon/check.svg';
import elementReady from 'element-ready';
import features from '../libs/features';
import SearchQuery from '../libs/search-query';

function addMergeLink(): void {
	if (!features.isPRList()) {
		return;
	}

	// The links in `.table-list-header-toggle` are either:
	//   1 Open | 1 Closed
	//   1 Total  // This apparently only appears when the query contains is:merged
	const lastLink = select<HTMLAnchorElement>('.table-list-header-toggle > :last-child')!;
	const searchQuery = new SearchQuery(lastLink);

	// In this case, it's a "Total" link, which appears if the query includes "is:merged".
	// This means that the link itself is showing the number of merged issues, so it can be renamed to "Merged".
	if (searchQuery.includes('is:merged')) {
		lastLink.lastChild!.textContent = lastLink.lastChild!.textContent!.replace('Total', 'Merged');
		return;
	}

	// In this case, `lastLink` is expected to be a "Closed" link
	const mergeLink = lastLink.cloneNode(true);
	mergeLink.textContent = 'Merged';
	mergeLink.classList.toggle('selected', new SearchQuery(location).includes('is:merged'));
	searchQuery.replace('is:closed', 'is:merged');
	lastLink.after(' ', mergeLink);
}

function togglableFilters(): void {
	for (const link of select.all<HTMLAnchorElement>('.table-list-header-toggle a')) {
		select('.octicon', link)?.remove();
		if (link.classList.contains('selected')) {
			link.prepend(checkIcon());
			new SearchQuery(link).remove(
				'is:open',
				'is:closed',
				'is:merged'
			);
		}
	}
}

async function init(): Promise<void | false> {
	await elementReady('.table-list-filters + *');

	addMergeLink();
	togglableFilters();
}

features.add({
	id: __featureName__,
	description: 'Lets you toggle between is:open/is:closed/is:merged filters in searches.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/73605061-2125ed00-45cc-11ea-8cbd-41a53ae00cd3.gif',
	include: [
		features.isDiscussionList
	],
	load: features.nowAndOnAjaxedPages,
	init
});
