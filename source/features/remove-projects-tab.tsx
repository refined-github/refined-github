/*
The `Projects` tab is hidden from repositories, user profiles and organization profiles when there are no projects

New projects can still be created via the [`Create new…` menu](https://user-images.githubusercontent.com/1402241/34909214-18b6fb2e-f8cf-11e7-8556-bed748596d3b.png).
*/

import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import features from '../libs/features';
import {safeElementReady} from '../libs/dom-utils';
import {isOwnUserProfile, isUserProfile} from '../libs/page-detect';

const addNewProjectLink = onetime(() => {
	if (isOwnUserProfile()) {
		// The link already exists
		return;
	}

	if (isUserProfile() && select.exists('[href*="contact/report-abuse?report="]')) {
		// This is an org; if there's a Report Abuse link, we're not part of the org, so we can't create projects
		return;
	}

	// We can't detect whether we can create projects on a repo,
	// so we're just gonna show a potentially-404 link. 🤷

	const path = location.pathname.split('/', 3);
	const base = path.length > 2 ? path.join('/') : '/orgs' + path.join('/');
	select('.HeaderMenu [href="/new"]').parentElement.append(
		// URLs patterns:
		// https://github.com/orgs/USER/projects/new
		// https://github.com/USER/REPO/projects/new
		<a class="dropdown-item" href={base + '/projects/new'}>
			New project
		</a>
	);
});

async function init() {
	await safeElementReady(`
		.orghead + *,
		.repohead + *,
		.user-profile-nav + *
	`); // Wait for the tab bar to be loaded

	addNewProjectLink();

	// If there's a settings tab, the current user can disable the projects,
	// so the tab should not be hidden
	if (select.exists([
		'.js-repo-nav [data-selected-links^="repo_settings"]', // In repos
		'.pagehead-tabs-item[href$="/settings/profile"]' // In organizations
	].join())) {
		return;
	}

	const projectsTab = select([
		'[data-hotkey="g b"]:not(.selected)', // In organizations and repos
		'.user-profile-nav [href$="?tab=projects"]:not(.selected)' // In user profiles
	].join());

	if (projectsTab && select('.Counter', projectsTab).textContent.trim() === '0') {
		projectsTab.remove();
	}
}

features.add({
	id: 'remove-projects-tab',
	include: [
		features.isRepo,
		features.isUserProfile
	],
	load: features.onAjaxedPages,
	init
});
