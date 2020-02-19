import cache from 'webext-storage-cache';
import select from 'select-dom';
import bugIcon from '@primer/octicons/build/svg/bug.svg';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as api from '../libs/api';
import SearchQuery from '../libs/search-query';
import {getRepoGQL, getRepoURL} from '../libs/utils';

const countIssuesAndBugs = cache.function(async (): Promise<{totalCount: number; bugsCount: number}> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			bugs: issues(labels: ["bug"], states: [OPEN]) {
				totalCount
			}
			open: issues(states: [OPEN]) {
				totalCount
			}
		}
	`);
	return {totalCount: repository.open.totalCount, bugsCount: repository.bugs.totalCount};
}, {
	expiration: 1,
	cacheKey: (): string => __featureName__ + ':' + getRepoURL()
});

async function init(): Promise<void | false> {
	// Query API as early as possible, even if it's not necessary on archived repos
	const countPromise = countIssuesAndBugs();

	// On a label:bug listing:
	// - always show the tab, as soon as possible
	// - update the count later
	// On other pages:
	// - only show the tab if needed
	const isBugsPage = new SearchQuery(location).includes('label:bug');
	if (!isBugsPage && (await countPromise).bugsCount === 0) {
		return false;
	}

	const issuesTab = (await elementReady('.reponav [data-hotkey="g i"]'))?.parentElement;
	if (!issuesTab) {
		// Repo is archived
		return false;
	}

	if (isBugsPage) {
		// Hide pinned issues on the tab page, they might not belong there
		// Don't await; if there are no pinned issues, this would delay the bug count update
		elementReady('.js-pinned-issues-reorder-container').then(pinnedIssues => pinnedIssues?.remove());
	}

	// Copy Issues tab but update its appearance
	const bugsTab = issuesTab.cloneNode(true);
	select('.octicon', bugsTab)!.replaceWith(bugIcon());
	select('.Counter', bugsTab)!.textContent = '0';
	select('[itemprop="name"]', bugsTab)!.textContent = 'Bugs';

	// Update Bugs’ link
	const bugsLink = select('a', bugsTab)!;
	new SearchQuery(bugsLink).add('label:bug');

	// Hide bugs from Issues tab
	const issuesLink = select('a', issuesTab)!;
	new SearchQuery(issuesLink).add('-label:bug');

	// Change the Selected tab if necessary
	bugsLink.classList.toggle('selected', isBugsPage);
	select('.selected', issuesTab)?.classList.toggle('selected', !isBugsPage);

	issuesTab.after(bugsTab);

	const {totalCount, bugsCount} = await countPromise;
	const nf = new Intl.NumberFormat();

	// Update issue counts
	select('.Counter', bugsTab)!.textContent = nf.format(bugsCount);
	const issueCount = totalCount - bugsCount;
	// Github displays count as "5,000+" in issues tab if more than 5000 issues. Keep the same behaviour.
	const ISSUE_UPPER_LIMIT = 5000;
	const issueCountString = issueCount > ISSUE_UPPER_LIMIT ? `${nf.format(ISSUE_UPPER_LIMIT)}+` : nf.format(issueCount);
	select('.Counter', issuesTab)!.textContent = issueCountString;
}

features.add({
	id: __featureName__,
	description: 'Adds a "Bugs" tab to repos, if there are any open issues with the "bug" label.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/73720910-a688d900-4755-11ea-9c8d-70e5ddb3bfe5.png',
	include: [
		features.isRepo
	],
	load: features.nowAndOnAjaxedPages,
	init
});
