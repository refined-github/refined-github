import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepositoryInfo, getRepoURL, getRepoGQL} from '../github-helpers';

const hasAnyProjects = cache.function(async (): Promise<boolean> => {
	const {repository, organization} = await api.v4(`
		repository(${getRepoGQL()}) {
			projects { totalCount }
		}
		organization(login: "${getRepositoryInfo().owner!}") {
			projects { totalCount }
		}
	`, {
		allowErrors: true
	});

	return Boolean(repository.projects.totalCount) && Boolean(organization?.projects?.totalCount);
}, {
	maxAge: {
		days: 1
	},
	staleWhileRevalidate: {
		days: 20
	},
	cacheKey: () => `has-projects:${getRepoURL()}`
});

function getCount(element: HTMLElement): number {
	return Number(element.textContent!.trim());
}

async function hideMilestones(): Promise<void> {
	const milestones = select('[data-selected-links^="repo_milestones"] .Counter')!;
	if (getCount(milestones) === 0) {
		select('[data-hotkey="m"]')!.parentElement!.remove();
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
		select('[data-hotkey="p"]')!.parentElement!.remove();
	}
}

async function init(): Promise<void | false> {
	if (!await elementReady('#js-issues-toolbar')) {
		// Repo has no issues, so no toolbar is shown
		return false;
	}

	await Promise.all([
		hideMilestones(),
		hideProjects()
	]);
}

void features.add({
	id: __filebasename,
	description: 'Hides `Projects` and `Milestones` filters in conversation lists if they are empty.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/59083449-0ef88f80-8915-11e9-8296-68af1ddcf191.png'
}, {
	include: [
		pageDetect.isRepoConversationList
	],
	awaitDomReady: false,
	init
});
