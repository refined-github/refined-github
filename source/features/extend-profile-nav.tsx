import './extend-profile-nav.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import CodeSquareIcon from '@primer/octicons-v2/build/svg/code-square.svg';

import features from '.';
import * as api from '../github-helpers/api';
import {getCleanPathname} from '../github-helpers';

interface UserCounts {
	repositories: number;
	projects: number;
	packages: number;
	gists: number;
}

const getUserCounts = cache.function(async (username: string): Promise<UserCounts> => {
	const {user} = await api.v4(`
		user(login: "${username}") {
			repositories {
				totalCount
			}
			projects {
				totalCount
			}
			packages {
				totalCount
			}
			gists {
				totalCount
			}
		}
	`);
	return {
		repositories: user.repositories.totalCount,
		projects: user.projects.totalCount,
		packages: user.packages.totalCount,
		gists: user.gists.totalCount
	};
}, {
	cacheKey: ([username]) => 'user-counts:' + username
});

const getOrganizationPackageCount = cache.function(async (organizationName: string): Promise<number> => {
	const {organization} = await api.v4(`
	  organization(login: "${organizationName}") {
			packages {
				totalCount
			}
		}
	`);
	return organization.packages.totalCount;
}, {
	cacheKey: ([organizationName]) => 'organization-package-count:' + organizationName
});

async function extendUserNav(): Promise<void> {
	await elementReady('.UnderlineNav-body + *');

	const username = getCleanPathname();
	const href = pageDetect.isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;
	const nav = select('.UnderlineNav-body')!;
	// Pre "Repository refresh" layout
	const isOldDesign = Boolean(nav.closest('.user-profile-nav'));
	const link = (
		<a href={href} className="UnderlineNav-item" role="tab" aria-selected="false">
			{!isOldDesign && <CodeSquareIcon className="UnderlineNav-octicon hide-sm"/>} Gists
		</a>
	);

	nav.append(link);

	const {repositories, projects, packages, gists} = await getUserCounts(username);

	if (!isOldDesign) {
		if (repositories > 0) {
			// Use `*=` to ensure compatibility with `set-default-repositories-type-to-sources`
			select('[aria-label="User profile"] [href*="tab=repositories"]')!.append(
				<span className="Counter">{repositories}</span>
			);
		}

		const projectsElement = select('[aria-label="User profile"] [href$="tab=projects"]')!;
		if (projects > 0) {
			projectsElement.append(<span className="Counter">{projects}</span>);
		} else {
			projectsElement.remove();
		}

		const packagesElement = select('[aria-label="User profile"] [href$="tab=packages"]');
		if (packages > 0) {
			packagesElement!.append(<span className="Counter">{packages}</span>);
		} else {
			packagesElement?.remove();
		}
	}

	if (gists > 0) {
		link.append(<span className="Counter">{gists}</span>);
	}
}

async function extendOrganizationNav(): Promise<void> {
	const packageElement = select('[aria-label="Organization"] .d-flex:nth-child(2) .UnderlineNav-item');

	if (packageElement) {
		const username = getCleanPathname();
		const packageCount = await getOrganizationPackageCount(username);

		if (packageCount > 0) {
			packageElement.append(<span className="Counter">{packageCount}</span>);
		} else {
			packageElement.remove();
		}
	}
}

void features.add({
	id: __filebasename,
	description: 'Extend profile navigation with counts, gists and hide empty items.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/85816958-3bd94800-b79f-11ea-8b1d-094211224ccb.png'
}, {
	include: [
		pageDetect.isUserProfile
	],
	waitForDomReady: false,
	init: extendUserNav
}, {
	include: [
		pageDetect.isOrganizationProfile
	],
	waitForDomReady: false,
	init: extendOrganizationNav
});
