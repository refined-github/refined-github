import './profile-gists-link.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import {CodeSquareIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getCleanPathname} from '../github-helpers';

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
	cacheKey: ([username]) => 'gist-count:' + username
});

async function init(): Promise<void> {
	await elementReady('.UnderlineNav-body + *');

	const username = getCleanPathname();
	const href = pageDetect.isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;
	const link = (
		<a href={href} className="UnderlineNav-item" role="tab" aria-selected="false">
			<CodeSquareIcon className="UnderlineNav-octicon hide-sm"/> Gists
		</a>
	);

	select('.UnderlineNav-body')!.append(link);

	const count = await getGistCount(username);
	if (count > 0) {
		link.append(<span className="Counter">{count}</span>);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isUserProfile
	],
	awaitDomReady: false,
	init
});
