import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';

const hasAnyProjects = cache.function(async (): Promise<boolean | 'disabled'> => {
	const {repository, organization} = await api.v4(`
		repository() {
			projects { totalCount }
			hasProjectsEnabled
		}
		organization(login: "${getRepo()!.owner}") {
			projects { totalCount }
		}
	`, {
		allowErrors: true,
	});

	if (!repository.hasProjectsEnabled && organization?.projects?.totalCount === 0) {
		return 'disabled';
	}

	return Boolean(repository.projects.totalCount) || Boolean(organization?.projects?.totalCount);
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: () => `has-projects:${getRepo()!.nameWithOwner}`,
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

async function hasProjects(isOrganization: boolean): Promise<boolean | 'disabled'> {
	const activeProjectsCounter = select('[data-hotkey="g b"] .Counter');
	if (activeProjectsCounter && getCount(activeProjectsCounter) > 0) {
		return true;
	}

	if (!activeProjectsCounter && !isOrganization) {
		// No tab = Projects disabled in repo
		// No organization = no Projects in organization
		return false;
	}

	return hasAnyProjects();
}

const projectsDropdownSelector = '[data-hotkey="p"]';
async function hideProjects(): Promise<void> {
	const isOrganization = select.exists('[rel=author][data-hovercard-type="organization"]');
	const projectsState = await hasProjects(isOrganization);

	if (projectsState === 'disabled' && isOrganization) {
		// If the repository's organization hasn't disabled Projects, the dropdown will exist even if they're disabled in the repo #4884
		(await elementReady(projectsDropdownSelector))?.parentElement?.remove();
	}

	if (projectsState === false) {
		(await elementReady(projectsDropdownSelector))!.parentElement!.remove();
	}
}

async function init(): Promise<void | false> {
	if (!await elementReady('#js-issues-toolbar', {waitForChildren: false})) {
		// Repo has no issues, so no toolbar is shown
		return false;
	}

	await Promise.all([
		hideMilestones(),
		hideProjects(),
	]);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoConversationList,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
