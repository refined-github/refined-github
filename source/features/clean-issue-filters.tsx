import select from 'select-dom';
import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as api from '../libs/api';
import {getOwnerAndRepo, getRepoURL, getRepoGQL} from '../libs/utils';

const hasAnyProjects = cache.function(async (): Promise<boolean> => {
	const {repository, organization} = await api.v4(`
		repository(${getRepoGQL()}) {
			projects { totalCount }
		}
		organization(login: "${getOwnerAndRepo().ownerName!}") {
			projects { totalCount }
		}
	`, {
		allowErrors: true
	});

	return Boolean(repository.projects.totalCount) && Boolean(organization?.projects?.totalCount);
}, {
	maxAge: 3,
	staleWhileRevalidate: 20,
	cacheKey: () => `has-projects:${getRepoURL()}`
});

function hasLocalCounter(selector: string): boolean {
	return Number(select(`${selector} .Counter`)?.textContent?.trim()) > 0;
}

async function hideMilestones(): Promise<void> {
	const hasMilestones = hasLocalCounter('[data-selected-links^="repo_milestones"]');

	if (hasMilestones) {
		(await elementReady('[data-hotkey="m"]'))?.parentElement?.remove();
	}
}

async function hideProjects(): Promise<void> {
	const hasActiveProjects = hasLocalCounter('[data-hotkey="g b"]');
	if (!hasActiveProjects && !await hasAnyProjects()) {
		(await elementReady('[data-hotkey="p"]'))?.parentElement?.remove();
	}
}

function init(): void {
	hideMilestones();
	hideProjects();
}

features.add({
	id: __featureName__,
	description: 'Hides `Projects` and `Milestones` filters in discussion lists if they are empty.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/59083449-0ef88f80-8915-11e9-8296-68af1ddcf191.png'
}, {
	include: [
		features.isRepoDiscussionList
	],
	load: features.nowAndOnAjaxedPages,
	init
});
