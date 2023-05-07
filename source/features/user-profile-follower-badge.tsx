import React from 'dom-chef';
import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import * as api from '../github-helpers/api.js';
import {getUsername, getCleanPathname} from '../github-helpers/index.js';
import attachElement from '../helpers/attach-element.js';

const doesUserFollow = cache.function('user-follows', async (userA: string, userB: string): Promise<boolean> => {
	const {httpStatus} = await api.v3(`/users/${userA}/following/${userB}`, {
		json: false,
		ignoreHTTPStatus: true,
	});

	return httpStatus === 204;
});

async function init(): Promise<void> {
	if (!await doesUserFollow(getCleanPathname(), getUsername()!)) {
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
