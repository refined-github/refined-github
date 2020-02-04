import select from 'select-dom';
import bugIcon from '@primer/octicons/build/svg/bug.svg';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as api from '../libs/api';
import {getRepoGQL} from '../libs/utils';
import SearchQuery from '../libs/search-query';

async function countBugs(): Promise<number> {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			bugs: issues(labels: ["bug"], states: [OPEN]) {
				totalCount
			}
		}
	`);

	return repository.bugs.totalCount;
}

async function addBugsTab(isBugsPage: boolean): Promise<HTMLElement | false> {
	const issuesTab = (await elementReady('.reponav [data-hotkey="g i"]'))?.parentElement;
	if (!issuesTab) {
		// Repo is archived
		return false;
	}

	// Copy Issues tab but update its appearance
	const bugsTab = issuesTab.cloneNode(true);
	select('.octicon', bugsTab)!.replaceWith(bugIcon());
	select('.Counter', bugsTab)!.textContent = '0';
	select('[itemprop="name"]', bugsTab)!.textContent = 'Bugs';

	// Update Bugs’ link
	const bugsLink = select('a', bugsTab)!;
	new SearchQuery(bugsLink).edit(query => `${query} label:bug`);

	// Change the Selected tab if necessary
	bugsLink.classList.toggle('selected', isBugsPage);
	select('.selected', issuesTab)?.classList.toggle('selected', !isBugsPage);

	issuesTab.after(bugsTab);

	return bugsTab;
}

async function init(): Promise<void | false> {
	// Query API as early as possible, even if it's not necessary on archived repos
	const countPromise = countBugs();

	const isBugsPage = new SearchQuery(location).includes('label:bug');

	let bugsTab: HTMLElement | false;
	if (isBugsPage) {
		// Add tab instantly if the user is on the Bug label
		bugsTab = await addBugsTab(isBugsPage);

		// Hide pinned issues on the tab page, they might not belong there
		// Don't await; if there are no pinned issues, this would delay the bug count update
		elementReady('.js-pinned-issues-reorder-container').then(pinnedIssues => pinnedIssues?.remove());
	} else if (await countPromise === 0) {
		// No bugs page, no bugs, don't add tab
		return false;
	} else {
		// No bugs page, but has bugs
		bugsTab = await addBugsTab(isBugsPage);
	}

	if (bugsTab) {
		const count = await countPromise;
		select('.Counter', bugsTab)!.textContent = String(count);
	}
}

features.add({
	id: __featureName__,
	description: 'Adds a "Bugs" tab to repos, if there are any open issues with the "bugs" label.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/73720910-a688d900-4755-11ea-9c8d-70e5ddb3bfe5.png',
	include: [
		features.isRepo
	],
	load: features.nowAndOnAjaxedPages,
	init
});
