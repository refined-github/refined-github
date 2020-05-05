import './user-profile-follower-badge.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getUsername, getCleanPathname} from '../libs/utils';

const doesUserFollow = cache.function(async (userA: string, userB: string): Promise<boolean> => {
	const {httpStatus} = await api.v3(`users/${userA}/following/${userB}`, {
		ignoreHTTPStatus: true
	});

	return httpStatus === 204;
}, {
	maxAge: 3,
	cacheKey: ([userA, userB]) => `user-follows:${userA}:${userB}`
});

async function init(): Promise<void> {
	if (await doesUserFollow(getCleanPathname(), getUsername())) {
		select('.vcard-names-container:not(.is-placeholder)')!.after(
			<div className="rgh-follower-badge">Follows you</div>
		);
	}
}

features.add({
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
