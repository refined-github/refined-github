import './mark-private-orgs.css';

import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import EyeClosedIcon from 'octicons-plain-react/EyeClosed';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getLoggedInUser} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

const publicOrganizationsNames = new CachedFunction('public-organizations', {
	async updater(username: string): Promise<string[]> {
	// API v4 seems to *require* `org:read` permission AND it includes private organizations as well, which defeats the purpose. There's no way to filter them.
	// GitHub's API explorer inexplicably only includes public organizations.
		const response = await api.v3(`/users/${username}/orgs`);
		return response.map((organization: AnyObject) => organization.login);
	},
	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 10},
});

function markPrivate(org: HTMLAnchorElement, organizations: string[]): void {
	if (!organizations.includes(org.pathname.replace(/^\/(organizations\/)?/, ''))) {
		org.classList.add('rgh-private-org');
		org.append(<EyeClosedIcon />);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	const organizations = await publicOrganizationsNames.get(getLoggedInUser()!);
	observe(
		'a.avatar-group-item[data-hovercard-type="organization"][itemprop="follows"]',
		org => {
			markPrivate(org, organizations);
		},
		{signal, stopOnDomReady: true},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isOwnUserProfile,
	],
	init,
});

/*

Test URLs:

https://github.com/YOUR_USERNAME

*/
