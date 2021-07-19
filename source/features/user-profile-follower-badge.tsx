import './user-profile-follower-badge.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getUsername, getCleanPathname} from '../github-helpers';

const doesUserFollow = cache.function(async (userA: string, userB: string): Promise<boolean> => {
	const {httpStatus} = await api.v3(`/users/${userA}/following/${userB}`, {
		json: false,
		ignoreHTTPStatus: true,
	});

	return httpStatus === 204;
}, {
	cacheKey: ([userA, userB]) => `user-follows:${userA}:${userB}`,
});

async function init(): Promise<void> {
	if (await doesUserFollow(getCleanPathname(), getUsername()!)) {
		select('.js-profile-editable-area .octicon-star')!.closest('mb-3')!.append(
			<span className="text-gray color-text-secondary"> · Follows you</span>,
		);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isUserProfile,
	],
	exclude: [
		pageDetect.isOwnUserProfile,
	],
	init,
});
