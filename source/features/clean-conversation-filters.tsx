import {CachedFunction} from 'webext-storage-cache';
import {elementExists} from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api, {expectTokenScope} from '../github-helpers/api.js';
import {cacheByRepo} from '../github-helpers/index.js';
import HasAnyProjects from './clean-conversation-filters.gql';

const hasAnyProjects = new CachedFunction('has-projects', {
	async updater(): Promise<boolean> {
		const activeProjectsCounter = await elementReady('[data-hotkey="g b"] .Counter');
		if (activeProjectsCounter && getCount(activeProjectsCounter) > 0) {
			return true;
		}

		const isOrganization = elementExists('[rel=author][data-hovercard-type="organization"]');
		if (!activeProjectsCounter && !isOrganization) {
			// No tab = Projects disabled in repo
			// No organization = no Projects in organization
			return false;
		}

		await expectTokenScope('read:project');
		const {repository, organization} = await api.v4(HasAnyProjects, {
			allowErrors: true,
		});

		return Boolean(repository.projects.totalCount)
			|| Boolean(repository.projectsV2.totalCount)
			|| Boolean(organization?.projects?.totalCount)
			|| Boolean(organization?.projectsV2?.totalCount);
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: cacheByRepo,
});

function getCount(element: HTMLElement): number {
	return Number(element.textContent.trim());
}

async function hideMilestones(): Promise<void> {
	const milestones = await elementReady('[data-selected-links^="repo_milestones"] .Counter');
	if (getCount(milestones!) === 0) {
		(await elementReady('[data-hotkey="m"]'))!.parentElement!.remove();
	}
}

async function hideProjects(): Promise<void> {
	const projectsDropdown = await elementReady('[data-hotkey="p"]');
	projectsDropdown?.parentElement!.remove();
}

// Toolbar is shown only if the repo has ever had an issue/PR
async function hasConversations(): Promise<boolean> {
	return Boolean(elementReady('#js-issues-toolbar', {waitForChildren: false}));
}

void features.add(import.meta.url, {
	asLongAs: [
		hasConversations,
	],
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	deduplicate: 'has-rgh-inner',
	init: hideMilestones,
}, {
	asLongAs: [
		hasConversations,
	],
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	exclude: [
		async () => hasAnyProjects.get(),
	],
	deduplicate: 'has-rgh-inner',
	init: hideProjects,
});

/*

Test URLs:

- Has conversations: https://github.com/refined-github/refined-github/pulls
- No conversations: https://github.com/fregante/empty/pulls

*/
