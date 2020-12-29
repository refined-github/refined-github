import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';

const hasAnyProjects = cache.function(async (): Promise<boolean> => {
	const {repository, organization} = await api.v4(`
		repository() {
			projects { totalCount }
		}
		organization(login: "${getRepo()!.owner}") {
			projects { totalCount }
		}
	`, {
		allowErrors: true
	});

	return Boolean(repository.projects.totalCount) && Boolean(organization?.projects?.totalCount);
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: () => `has-projects:${getRepo()!.nameWithOwner}`
});

function getCount(element: HTMLElement): number {
	return Number(element.textContent!.trim());
}

async function hideMilestones(): Promise<void> {
	const milestones = $('[data-selected-links^="repo_milestones"] .Counter')!;
	if (getCount(milestones) === 0) {
		$('[data-hotkey="m"]')!.parentElement!.remove();
	}
}

async function hasProjects(): Promise<boolean> {
	const activeProjectsCounter = $('[data-hotkey="g b"] .Counter');
	if (activeProjectsCounter && getCount(activeProjectsCounter) > 0) {
		return true;
	}

	const isOrganization = $.exists('[rel=author][data-hovercard-type="organization"]');
	if (!activeProjectsCounter && !isOrganization) {
		// No tab = Projects disabled in repo
		// No organization = no Projects in organization
		return false;
	}

	return hasAnyProjects();
}

async function hideProjects(): Promise<void> {
	if (!await hasProjects()) {
		$('[data-hotkey="p"]')!.parentElement!.remove();
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

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoConversationList
	],
	awaitDomReady: false,
	init
});
