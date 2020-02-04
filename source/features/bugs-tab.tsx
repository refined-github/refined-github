import select from 'select-dom';
import bugIcon from '@primer/octicons/build/svg/bug.svg';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as api from '../libs/api';
import {getRepoGQL} from '../libs/utils';

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

async function init(): Promise<void | false> {
	// Query API as early as possible, even if it's not necessary on archived repos
	const count = await countBugs();
	if (count === 0) {
		return false;
	}

	const issuesTab = (await elementReady('.reponav [data-hotkey="g i"]'))?.parentElement;
	if (!issuesTab) {
		// Repo is archived
		return false;
	}

	const isBugsPage = /[^-]label:bug/.test(new URLSearchParams(location.search).get('q')!);

	const bugsTab = issuesTab.cloneNode(true);
	select('.octicon', bugsTab)!.replaceWith(bugIcon());
	select('.Counter', bugsTab)!.textContent = String(count);
	select('[itemprop="name"]', bugsTab)!.textContent = 'Bugs';

	const bugsLink = select('a', bugsTab)!;
	bugsLink.search += '+label%3Abug';
	bugsLink.classList.toggle('selected', isBugsPage);
	select('.selected', issuesTab)?.classList.toggle('selected', !isBugsPage);

	issuesTab.after(bugsTab);

	if (isBugsPage) {
		(await elementReady('.js-pinned-issues-reorder-container'))?.remove();
	}
}

features.add({
	id: __featureName__,
	description: 'Adds a "Bugs" tab to repos, if there are any open issues with the "bugs" label.',
	screenshot: '',
	include: [
		features.isRepo
	],
	load: features.nowAndOnAjaxedPages,
	init
});
