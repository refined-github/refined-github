import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import {cacheByRepo, getRepo} from '../github-helpers';

const hasAnyProjects = cache.function('has-projects', async (): Promise<boolean> => {
	const {repository, organization} = await api.v4(`
		repository() {
			projects { totalCount }
		}
		organization(login: "${getRepo()!.owner}") {
			projects { totalCount }
		}
	`, {
		allowErrors: true,
	});

	return Boolean(repository.projects.totalCount) && Boolean(organization?.projects?.totalCount);
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: cacheByRepo,
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
	// TODO: False negatives require a `?.` #4884
	if (!await hasProjects()) {
		const projectsDropdown = await elementReady('[data-hotkey="p"]');
		projectsDropdown?.parentElement!.remove();
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

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
