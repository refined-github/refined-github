import select from 'select-dom';
import cache from 'webext-storage-cache';
import features from '../libs/features';
import * as api from '../libs/api';
import {getOwnerAndRepo} from '../libs/utils';

type CacheEntry = {
	repoProjectCount: number;
	orgProjectCount: number;
	milestoneCount: number;
};

async function getCount(): Promise<CacheEntry> {
	const {ownerName, repoName} = getOwnerAndRepo();
	const cacheKey = `clean-issue-filters:${ownerName}/${repoName}`;
	const cachedData = await cache.get<CacheEntry>(cacheKey);
	if (cachedData) {
		return cachedData;
	}

	const result = await api.v4(`
		repository(owner: "${ownerName}", name: "${repoName}") {
			projects { totalCount }
			milestones { totalCount }
		}
		organization(login: "${ownerName}") {
			projects { totalCount }
		}
	`, {
		allowErrors: true
	});

	const cacheEntry = {
		repoProjectCount: result.repository.projects.totalCount,
		orgProjectCount: result.organization ? result.organization.projects.totalCount : 0,
		milestoneCount: result.repository.milestones.totalCount
	};

	cache.set(cacheKey, cacheEntry, 1);
	return cacheEntry;
}

async function init(): Promise<void> {
	const {repoProjectCount, orgProjectCount, milestoneCount} = await getCount();

	// If the repo and organization has no projects, its selector will be empty
	if (repoProjectCount === 0 && orgProjectCount === 0 && select.exists('[data-hotkey="p"')) {
		select('[data-hotkey="p"')!.parentElement!.remove();
	}

	// If the repo has no milestones, its selector will be empty
	if (milestoneCount === 0 && select.exists('[data-hotkey="m"')) {
		select('[data-hotkey="m"')!.parentElement!.remove();
	}
}

features.add({
	id: __featureName__,
	description: 'Hides `Projects` and `Milestones` filters in discussion lists if they are empty.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/59083449-0ef88f80-8915-11e9-8296-68af1ddcf191.png',
	load: features.onAjaxedPages,
	include: [
		features.isRepoDiscussionList
	],
	init
});
