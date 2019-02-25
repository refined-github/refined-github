/*
The `Projects` tab is hidden from repositories and profiles when there are no projects

New projects can still be created via the [`Create new…` menu](https://user-images.githubusercontent.com/1402241/34909214-18b6fb2e-f8cf-11e7-8556-bed748596d3b.png).
*/

import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import features, {AsyncFeatureInit} from '../libs/features';
import {safeElementReady} from '../libs/dom-utils';
import {isUserProfile, isOwnOrganizationProfile, isOrganizationProfile} from '../libs/page-detect';

const addNewProjectLink = onetime(() => {
	if (isUserProfile()) {
		// The link already exists on our profile,
		// and we can't create projects on others' profiles
		return;
	}

	if (isOrganizationProfile() && !isOwnOrganizationProfile()) {
		// We can only add projects to our organizations
		return;
	}

	// We can't detect whether we can create projects on a repo,
	// so we're just gonna show a potentially-404 link. 🤷

	// URLs patterns:
	// https://github.com/orgs/USER/projects/new
	// https://github.com/USER/REPO/projects/new
	const path = location.pathname.split('/', 3);
	const base = path.length > 2 ? path.join('/') : '/orgs' + path.join('/');
	select('.HeaderMenu [href="/new"]')!.parentElement!.append(
		<a class="dropdown-item" href={base + '/projects/new'}>
			New project
		</a>
	);
});

async function init(): AsyncFeatureInit {
	await safeElementReady(`
		.orghead + *,
		.repohead + *,
		.user-profile-nav + *
	`); // Wait for the tab bar to be loaded

	const projectsTab = select([
		'[data-hotkey="g b"]', // In organizations and repos
		'.user-profile-nav [href$="?tab=projects"]' // In user profiles
	].join());

	if (!projectsTab) {
		// Projects aren't enabled here
		return;
	}

	addNewProjectLink();

	// If there's a settings tab, the current user can disable the projects,
	// so the tab should not be hidden
	if (select.exists([
		'.js-repo-nav [data-selected-links^="repo_settings"]', // In repos
		'.pagehead-tabs-item[href$="/settings/profile"]' // In organizations
	].join())) {
		return;
	}

	// Only remove the tab if it's not the current page and if it has 0 projects
	if (!projectsTab.matches('.selected') && select('.Counter', projectsTab)!.textContent!.trim() === '0') {
		projectsTab.remove();
	}
}

features.add({
	id: 'remove-projects-tab',
	include: [
		features.isRepo,
		features.isUserProfile,
		features.isOrganizationProfile
	],
	load: features.onAjaxedPages,
	init
});
