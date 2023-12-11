import './mark-private-orgs.css';
import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {$$} from 'select-dom';
import {EyeClosedIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getUsername} from '../github-helpers/index.js';

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

async function init(): Promise<false | void> {
	const orgs = $$('a.avatar-group-item[data-hovercard-type="organization"][itemprop="follows"]'); // `itemprop` excludes sponsorships #3770
	if (orgs.length === 0) {
		return false;
	}

	const organizations = await publicOrganizationsNames.get(getUsername()!);
	for (const org of orgs) {
		if (!organizations.includes(org.pathname.replace(/^\/(organizations\/)?/, ''))) {
			org.classList.add('rgh-private-org');
			org.append(<EyeClosedIcon/>);
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isOwnUserProfile,
	],
	deduplicate: 'has-rgh',
	awaitDomReady: true, // TODO: Use the observer
	init,
});
