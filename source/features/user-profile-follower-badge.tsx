import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getUsername, getCleanPathname} from '../github-helpers/index.js';
import attachElement from '../helpers/attach-element.js';

const doesUserFollow = new CachedFunction('user-follows', {
	async updater(userA: string, userB: string): Promise<boolean> {
		const {httpStatus} = await api.v3(`/users/${userA}/following/${userB}`, {
			json: false,
			ignoreHTTPStatus: true,
		});

		return httpStatus === 204;
	}});

async function init(): Promise<void> {
	if (!await doesUserFollow.get(getCleanPathname(), getUsername()!)) {
		return;
	}

	const target = await elementReady('.js-profile-editable-area [href$="?tab=following"]');
	attachElement(target, {
		after: () => (
			<span className="color-fg-muted"> · Follows you</span>
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
