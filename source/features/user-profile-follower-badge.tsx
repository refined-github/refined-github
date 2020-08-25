import './user-profile-follower-badge.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getUsername, getCleanPathname} from '../github-helpers';

const doesUserFollow = cache.function(async (userA: string, userB: string): Promise<boolean> => {
	const {httpStatus} = await api.v3(`users/${userA}/following/${userB}`, {
		json: false,
		ignoreHTTPStatus: true
	});

	return httpStatus === 204;
}, {
	cacheKey: ([userA, userB]) => `user-follows:${userA}:${userB}`
});

async function init(): Promise<void> {
	if (await doesUserFollow(getCleanPathname(), getUsername())) {
		const newProfileElement = select('.js-profile-editable-area a:last-child');
		if (newProfileElement) {
			newProfileElement.after(<span className="text-gray"> · Follows you</span>);
		} else {
			// Pre "Repository refresh" layout
			select('.vcard-names-container:not(.is-placeholder)')!.after(
				<div className="rgh-follower-badge">Follows you</div>
			);
		}
	}
}

void features.add({
	id: __filebasename,
	description: 'Tells you whether the user follows you.',
	screenshot: 'https://user-images.githubusercontent.com/3723666/45190460-03ecc380-b20c-11e8-832b-839959ee2c99.gif'
}, {
	include: [
		pageDetect.isUserProfile
	],
	exclude: [
		pageDetect.isOwnUserProfile
	],
	init
});
