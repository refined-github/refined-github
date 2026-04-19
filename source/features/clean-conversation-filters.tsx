import {CachedFunction} from 'webext-storage-cache';
import {$optional} from 'select-dom/strict.js';
import {elementExists} from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {cacheByRepo} from '../github-helpers/index.js';
import HasAnyProjects from './clean-conversation-filters.gql';
import api from '../github-helpers/api.js';
import {expectToken, expectTokenScope} from '../github-helpers/github-token.js';
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

async function hideProjects(container: HTMLElement): Promise<void> {
	const filter = $optional('[data-testid="projects-anchor-button"]', container);

	// If the filter is missing, then it has been disabled organization-wide already
	if (filter && !(await hasAnyProjects.get())) {
		filter.remove();
	}
}

async function hide(container: HTMLElement): Promise<void> {
	// Keep separate so that one doesn't crash the other
	void hideProjects(container);
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe(String.raw`#\:rs\:-list-view-metadata`, hide, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	init,
});

/*

Test URLs:

- No projects: https://github.com/left-pad/left-pad/issues
- Projects and milestones (no-op): https://github.com/tc39/ecma402/issues

*/
