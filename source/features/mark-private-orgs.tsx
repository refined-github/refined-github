import './mark-private-orgs.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import EyeClosedIcon from 'octicon/eye-closed.svg';
import {getUsername} from '../libs/utils';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import * as api from '../libs/api';

const getPublicOrganizationsNames = cache.function(async (username: string): Promise<string[]> => {
	// API v4 seems to *require* `org:read` permission AND it includes private organizations as well, which defeats the purpose. There's no way to filter them.
	// GitHub's API explorer inexplicably only includes public organizations.
	const response = await api.v3(`users/${username}/orgs`);
	return response.map((organization: AnyObject) => organization.login);
}, {
	cacheKey: ([username]) => __filebasename + ':' + username,
	maxAge: 10
});

async function init(): Promise<false | void> {
	const orgs = select.all<HTMLAnchorElement>('.avatar-group-item[data-hovercard-type="organization"]');
	if (orgs.length === 0) {
		return false;
	}

	const publicOrganizationsNames = await getPublicOrganizationsNames(getUsername());
	for (const org of orgs) {
		if (!publicOrganizationsNames.includes(org.pathname.replace(/^\/(organizations\/)?/, ''))) {
			org.classList.add('rgh-private-org');
			org.append(<EyeClosedIcon/>);
		}
	}
}

features.add({
	id: __filebasename,
	description: 'Marks private organizations on your own profile.',
	screenshot: 'https://user-images.githubusercontent.com/6775216/44633467-d5dcc900-a959-11e8-9116-e6b0ffef66af.png'
}, {
	include: [
		pageDetect.isOwnUserProfile
	],
	init
});
