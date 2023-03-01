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

const getGistCount = cache.function('gist-count', async (username: string): Promise<number> => {
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
});

function getUser(): {url: string; name: string} {
	const name = getCleanPathname();
	const url = pageDetect.isEnterprise()
		? `/gist/${name}`
		: `https://gist.github.com/${name}`;
	return {url, name};
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

	// There are two UnderlineNav items (responsive…) that point to the same dropdown
	const overflowNav = select('.js-responsive-underlinenav .dropdown-menu ul')!;
	if (!select.exists('[data-rgh-label="Gists"]', overflowNav)) {
		overflowNav.append(
			createDropdownItem('Gists', user.url),
		);
	}

	const count = await getGistCount(user.name);
	if (count > 0) {
		link.append(<span className="Counter">{count}</span>);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe('nav[aria-label="User profile"]', appendTab, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfile,
	],
	init,
});
