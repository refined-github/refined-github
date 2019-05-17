import './user-profile-follower-badge.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getUsername, getCleanPathname} from '../libs/utils';

async function init(): Promise<void> {
	const {status} = await api.v3(
		`users/${getCleanPathname()}/following/${getUsername()}`,
		{ignoreHTTPStatus: true}
	);

	if (status === 204) {
		select('.vcard-names-container.py-3.js-sticky.js-user-profile-sticky-fields')!.after(
			<div className="follower-badge">Follows you</div>
		);
	}
}

features.add({
	id: 'user-profile-follower-badge',
	description: 'See whether a user follows you on their profile',
	include: [
		features.isUserProfile
	],
	exclude: [
		features.isOwnUserProfile
	],
	load: features.onAjaxedPages,
	init
});
