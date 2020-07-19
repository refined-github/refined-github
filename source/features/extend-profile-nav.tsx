import './extend-profile-nav.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import CodeSquareIcon from 'octicon/code-square.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getCleanPathname} from '../github-helpers';

interface UserCounts {
	projects: number;
	packages: number;
	gists: number;
}

const getProfileCounts = cache.function(async (username: string): Promise<UserCounts> => {
	const {user, organization} = await api.v4(`
		user(login: "${username}") {
			projects(states: OPEN) {
				totalCount
			}
			gists {
				totalCount
			}
		}
		organization(login: "${username}") {
			packages {
				totalCount
			}
		}
	`, {
		allowErrors: true
	});
	return {
		projects: user?.projects.totalCount,
		packages: organization?.packages.totalCount,
		gists: user?.gists.totalCount
	};
}, {
	cacheKey: ([username]) => 'profile-counts:' + username
});

async function initUser(): Promise<void> {
	await elementReady('.UnderlineNav-body + *');

	const username = getCleanPathname();
	const href = pageDetect.isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;
	const gistsLink = (
		<a href={href} className="UnderlineNav-item" role="tab" aria-selected="false">
			<CodeSquareIcon className="UnderlineNav-octicon hide-sm"/> Gists
		</a>
	);

	select('.UnderlineNav-body')!.append(gistsLink);

	const {projects, gists} = await getProfileCounts(username);

	const projectElement = select('[aria-label="User profile"] [href$="tab=projects"]')!;
	if (projects > 0) {
		projectElement.append(<span className="Counter">{projects}</span>);
	} else {
		projectElement.remove();
	}

	if (gists > 0) {
		gistsLink.append(<span className="Counter">{gists}</span>);
	}
}

async function initOrganization(): Promise<void> {
	const packageElement = select('[aria-label="Organization"] .d-flex:nth-child(2) .UnderlineNav-item');

	if (packageElement) {
		const username = getCleanPathname();
		const {packages} = await getProfileCounts(username);

		if (packages > 0) {
			packageElement.append(<span className="Counter">{packages}</span>);
		} else {
			packageElement.remove();
		}
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds counters and a link to Gist to user profiles, or hides empty sections.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/85816958-3bd94800-b79f-11ea-8b1d-094211224ccb.png'
}, {
	include: [
		pageDetect.isUserProfile
	],
	waitForDomReady: false,
	init: initUser
}, {
	include: [
		pageDetect.isOrganizationProfile
	],
	waitForDomReady: false,
	init: initOrganization
});
