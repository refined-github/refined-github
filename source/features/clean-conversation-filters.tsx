import {CachedFunction} from 'webext-storage-cache';
import {$, elementExists} from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {cacheByRepo} from '../github-helpers/index.js';
import HasAnyProjects from './clean-conversation-filters.gql';
import api from '../github-helpers/api.js';
import {expectTokenScope} from '../github-helpers/github-token.js';
import observe from '../helpers/selector-observer.js';

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

const MILESTONE_SELECTORS = ['#milestones-select-menu', '[data-testid="action-bar-item-milestones"]'];
const PROJECT_SELECTORS = ['#project-select-menu', '[data-testid="action-bar-item-projects"]'];

async function hide(container: HTMLElement): Promise<void> {
	const milestones = $('[data-selected-links^="repo_milestones"] .Counter');
	if (milestones && getCount(milestones) === 0) {
		$(MILESTONE_SELECTORS, container)?.remove();
	}

	if (await hasAnyProjects.get()) {
		return;
	}

	const projectsDropdown = $(PROJECT_SELECTORS, container);
	projectsDropdown?.remove();
}

function init(signal: AbortSignal): void {
	observe(['#js-issues-toolbar', '[data-testid="list-view-metadata"]'], hide, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});

/*

Test URLs:

- Has conversations: https://github.com/refined-github/refined-github/pulls
- No conversations: https://github.com/fregante/empty/pulls

*/
