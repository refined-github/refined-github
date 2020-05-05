import select from 'select-dom';
import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
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

function getCount(element: HTMLElement): number {
	return Number(element.textContent!.trim());
}

async function hideMilestones(): Promise<void> {
	const milestones = select('[data-selected-links^="repo_milestones"] .Counter')!;
	if (getCount(milestones) === 0) {
		(await elementReady('[data-hotkey="m"]'))!.parentElement!.remove();
	}
}

async function hasProjects(): Promise<boolean> {
	const activeProjectsCounter = select('[data-hotkey="g b"] .Counter');
	if (activeProjectsCounter && getCount(activeProjectsCounter) > 0) {
		return true;
	}

	const isOrganization = select.exists('[rel=author][data-hovercard-type="organization"]');
	if (!activeProjectsCounter && !isOrganization) {
		// No tab = Projects disabled in repo
		// No organization = no Projects in organization
		return false;
	}

	return hasAnyProjects();
}

async function hideProjects(): Promise<void> {
	if (!await hasProjects()) {
		(await elementReady('[data-hotkey="p"]'))!.parentElement!.remove();
	}
}

function init(): void {
	hideMilestones();
	hideProjects();
}

features.add({
	id: __filebasename,
	description: 'Hides `Projects` and `Milestones` filters in discussion lists if they are empty.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/59083449-0ef88f80-8915-11e9-8296-68af1ddcf191.png'
}, {
	include: [
		pageDetect.isRepoDiscussionList
	],
	waitForDomReady: false,
	init
});
