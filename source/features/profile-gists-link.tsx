import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {CodeSquareIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api';
import {getCleanPathname} from '../github-helpers';
import {createDropdownItem} from './more-dropdown-links';

const getGistCount = cache.function(async (username: string): Promise<number> => {
	const {user} = await api.v4(`
		user(login: "${username}") {
			gists(first: 0) {
				totalCount
			}
		}
	`);
	return user.gists.totalCount;
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: ([username]) => 'gist-count:' + username,
});

async function init(): Promise<void> {
	const username = getCleanPathname();
	const href = pageDetect.isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;
	const link = (
		<a
			href={href}
			className="UnderlineNav-item js-responsive-underlinenav-item"
			role="tab"
			aria-selected="false"
			data-tab-item="rgh-gists-item"
		>
			<CodeSquareIcon className="UnderlineNav-octicon hide-sm"/>
			{' Gists '}
		</a>
	);

	const navigationBar = (await elementReady('.UnderlineNav-body'))!;
	navigationBar.append(link);
	navigationBar.replaceWith(navigationBar);

	select('.js-responsive-underlinenav .dropdown-menu ul')!.append(
		createDropdownItem('Gists', href),
	);

	const count = await getGistCount(username);
	if (count > 0) {
		link.append(<span className="Counter">{count}</span>);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfile,
	],
	init,
});
