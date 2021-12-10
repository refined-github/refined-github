import './mark-private-orgs.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {EyeClosedIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api.js';
import {getUsername} from '../github-helpers.js';

const getPublicOrganizationsNames = cache.function(async (username: string): Promise<string[]> => {
	// API v4 seems to *require* `org:read` permission AND it includes private organizations as well, which defeats the purpose. There's no way to filter them.
	// GitHub's API explorer inexplicably only includes public organizations.
	const response = await api.v3(`/users/${username}/orgs`);
	return response.map((organization: AnyObject) => organization.login);
}, {
	maxAge: {days: 10},
	cacheKey: ([username]) => 'public-organizations:' + username,
});

async function init(): Promise<false | void> {
	const orgs = select.all('a.avatar-group-item[data-hovercard-type="organization"][itemprop="follows"]'); // `itemprop` excludes sponsorships #3770
	if (orgs.length === 0) {
		return false;
	}

	const publicOrganizationsNames = await getPublicOrganizationsNames(getUsername()!);
	for (const org of orgs) {
		if (!publicOrganizationsNames.includes(org.pathname.replace(/^\/(organizations\/)?/, ''))) {
			org.classList.add('rgh-private-org');
			org.append(<EyeClosedIcon/>);
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isOwnUserProfile,
	],
	init,
});
