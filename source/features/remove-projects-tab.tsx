import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';

function getProjectsTab() {
	return elementReady([
		'[data-hotkey="g b"]:not(.selected)', // In organizations and repos
		'.user-profile-nav [href$="?tab=projects"]' // In user profiles
	].join());
}

async function addNewProjectLink(): Promise<void |false> {
	if (!await getProjectsTab()) {
		return false;
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

async function removeProjectsTab(): Promise<void | false> {
	const projectsTab = await getProjectsTab();

	if (!projectsTab) {
		// Projects aren't enabled here
		return false;
	}

	// Dont run if the counter is 0. (When it does not exists it will converted to a 0)
	if (Number(select('.Counter', projectsTab)?.textContent!) !== 0) {
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
		pageDetect.canUserEditRepo,
		pageDetect.canUserEditOrganization
	],
	init: removeProjectsTab
}, {
	include: [
		pageDetect.isRepo,
		pageDetect.isOrganizationProfile
	],
	exclude: [
		() => !pageDetect.canUserEditRepo(),
		() => !pageDetect.canUserEditOrganization()
	],
	repeatOnAjax: false,
	init: addNewProjectLink
});
