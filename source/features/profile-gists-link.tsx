import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {CodeSquareIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import {getCleanPathname} from '../github-helpers';
import createDropdownItem from '../github-helpers/create-dropdown-item';
import observe from '../helpers/selector-observer';

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

function getUser(): {url: string; name: string} {
	const name = getCleanPathname();
	const url = pageDetect.isEnterprise()
		? `/gist/${name}`
		: `https://gist.github.com/${name}`;
	return {url, name};
}

async function init(signal: AbortSignal): Promise<void> {
	observe('.UnderlineNav-body', appendTab, {signal});
}

async function appendTab(navigationBar: Element): Promise<void> {
	const user = getUser();
	const link = (
		<a
			href={user.url}
			className="UnderlineNav-item js-responsive-underlinenav-item"
			role="tab"
			aria-selected="false"
			data-tab-item="rgh-gists-item"
		>
			<CodeSquareIcon className="UnderlineNav-octicon hide-sm"/>
			{' Gists '}
		</a>
	);

	navigationBar.append(link);
	navigationBar.replaceWith(navigationBar);

	select('.js-responsive-underlinenav .dropdown-menu ul')!.append(
		createDropdownItem('Gists', user.url),
	);

	const count = await getGistCount(user.name);
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
