import './profile-gists-link.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import CodeSquareIcon from '@primer/octicons-v2/build/svg/code-square.svg';

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

void features.add({
	id: __filebasename,
	description: 'Adds a link to the user’s public gists.',
	screenshot: 'https://user-images.githubusercontent.com/11544418/34268306-1c974fd2-e678-11e7-9e82-861dfe7add22.png'
}, {
	include: [
		pageDetect.isUserProfile
	],
	waitForDomReady: false,
	init
});
