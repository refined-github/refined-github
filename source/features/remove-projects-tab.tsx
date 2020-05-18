import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';

function getProjectsTab() {
	return elementReady([
		'[data-hotkey="g b"]', // In organizations and repos
		'.user-profile-nav [href$="?tab=projects"]' // In user profiles
	].join());
}

async function addNewProjectLink() {
	if (!await getProjectsTab()) {
		return;
	}
	// We can't detect whether we can create projects on a repo,
	// so we're just gonna show a potentially-404 link. 🤷

	// URLs patterns:
	// https://github.com/orgs/USER/projects/new
	// https://github.com/USER/REPO/projects/new
	const path = location.pathname.split('/', 3);
	const base = path.length > 2 ? path.join('/') : '/orgs' + path.join('/');
	select('.Header [href="/new"]')!.parentElement!.append(
		<a className="dropdown-item" href={base + '/projects/new'}>
			New project
		</a>
	);
}

async function removeProjectsTab(): Promise<void> {
	const projectsTab = await getProjectsTab();

	if (!projectsTab) {
		// Projects aren't enabled here
		return;
	}

	// Only remove the tab if it's not the current page and if it has 0 projects or on `isOrganizationProfile` it will be blank
	if (!projectsTab.matches('.selected') && ['0', ''].includes(select('.Counter', projectsTab)!.textContent!.trim().charAt(0))) {
		projectsTab.remove();
	}
}

features.add({
	id: __filebasename,
	description: 'Hides the `Projects` tab from repositories and profiles when it’s empty. New projects can still be created via the `Create new…` menu.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/34909214-18b6fb2e-f8cf-11e7-8556-bed748596d3b.png'
}, {
	include: [
		pageDetect.isRepo,
		pageDetect.isUserProfile,
		pageDetect.isOrganizationProfile
	],
	exclude: [
		pageDetect.canUserEditRepo,
		pageDetect.canUserEditOrganization
	],
	init: removeProjectsTab
}, {
	include: [
		pageDetect.isRepo,
		pageDetect.isOrganizationProfile
	],
	repeatOnAjax: false,
	init: addNewProjectLink
});
