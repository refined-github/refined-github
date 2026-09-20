/**
@description On profiles, it shows whether the user follows you.
@screenshot https://github-production-user-asset-6210df.s3.amazonaws.com/1402241/263206287-c8e1b94c-ec80-4394-bbb3-1cf6fb08b807.png
*/

import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getCleanPathname, getLoggedInUser} from '../github-helpers/index.js';
import attachElement from '../helpers/attach-element.js';

const doesUserFollow = new CachedFunction('user-follows', {
	async updater(userA: string, userB: string): Promise<boolean> {
		const {httpStatus} = await api.v3(`/users/${userA}/following/${userB}`, {
			responseFormat: 'text',
			ignoreHttpStatus: true,
		});

		return httpStatus === 204;
	},
});

async function init(): Promise<void> {
	if (!await doesUserFollow.get(getCleanPathname(), getLoggedInUser()!)) {
		return;
	}

	const target = await elementReady('.js-profile-editable-area [href$="?tab=following"]');
	attachElement(target, {
		after: () => (
			<span className="color-fg-muted">{' · Follows you'}</span>
		),
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfile,
	],
	exclude: [
		pageDetect.isOwnUserProfile,
		pageDetect.isPrivateUserProfile,
	],
	init,
});

/*

Test URLs:

1. Visit your own profile
2. Click on "X followers" below your profile picture
3. Click on a follower
4. Look for a "Follows you" badge below their profile picture

*/
