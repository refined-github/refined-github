import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';

function getProjectsTab() {
	return elementReady([
		'[data-hotkey="g b"]', // In organizations and repos
		'.user-profile-nav [href$="?tab=projects"]' // In user profiles
	].join());
}


// We can't detect whether the user can create projects on a repo, so this link is potentially a 404
async function addNewProjectLink(): Promise<void |false> {
	if (!await getProjectsTab()) {
		return false;
	}

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

async function removeProjectsTab(): Promise<void | false> {
	const projectsTab = await getProjectsTab();

	if (
		!projectsTab || // Projects disabled 🎉
		projectsTab.matches('.selected') || // User is on Projects tab 👀
		Number(select('.Counter', projectsTab)?.textContent) > 0 // There are open projects
	) {
		return false;
	}

	projectsTab.remove();
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
		// Repo/Organization owners should see the tab. If they don't need it, they should disable Projects altogether
		pageDetect.canUserEditRepo,
		pageDetect.canUserEditOrganization
	],
	waitForDomReady: false,
	init: removeProjectsTab
}, {
	include: [
		pageDetect.isRepo,
		pageDetect.isOrganizationProfile
	],
	repeatOnAjax: false,
	waitForDomReady: false,
	init: addNewProjectLink
});
