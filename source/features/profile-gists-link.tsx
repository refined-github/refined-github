import './profile-gists-link.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getCleanPathname} from '../libs/utils';
import {isEnterprise} from 'github-page-detection';

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

async function init(): Promise<false | void> {
	await elementReady('.UnderlineNav-body + *');

	const username = getCleanPathname();
	const href = isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;
	const link = <a href={href} className="UnderlineNav-item" role="tab" aria-selected="false">Gists </a>;

	select('.UnderlineNav-body')!.append(link);

	link.append(
		<span className="Counter hide-lg hide-md hide-sm">
			{await getGistCount(username)}
		</span>
	);
}

features.add({
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
