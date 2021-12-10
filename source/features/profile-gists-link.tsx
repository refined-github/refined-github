import React from 'dom-chef';
import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {CodeSquareIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api.js';
import {getCleanPathname} from '../github-helpers.js';

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
		<a href={href} className="UnderlineNav-item" role="tab" aria-selected="false">
			<CodeSquareIcon className="UnderlineNav-octicon hide-sm"/>
			{' Gists '}
		</a>
	);

	(await elementReady('.UnderlineNav-body'))!.append(link);

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
