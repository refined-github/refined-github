import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

function appendToNewDropdown(href: string): void {
	select('.Header [href="/new"]')!.parentElement!.append(
		<a className="dropdown-item" href={href}>
			New project
		</a>
	);
}

// eslint-disable-next-line import/prefer-default-export
export async function getProjectsTab(): Promise<HTMLElement | undefined> {
	return elementReady([
		'[data-hotkey="g b"]', // In organizations and repos
		'[aria-label="User profile"] [href$="?tab=projects"]' // In user profiles
	].join());
}

// We can't detect whether the user can create projects on a repo, so this link is potentially a 404
async function addNewProjectLink(): Promise<void | false> {
	if (!await getProjectsTab()) {
		return false;
	}

	// URLs patterns:
	// https://github.com/orgs/USER/projects/new
	// https://github.com/USER/REPO/projects/new
	const path = location.pathname.split('/', 3);
	const base = path.length > 2 ? path.join('/') : '/orgs' + path.join('/');
	appendToNewDropdown(base + '/projects/new');
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo,
		pageDetect.isOrganizationProfile
	],
	awaitDomReady: false,
	init: onetime(addNewProjectLink)
});
