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
		select('.vcard-names-container:not(.is-placeholder)')!.after(
			<div className="rgh-follower-badge">Follows you</div>
		);
	}
}

features.add({
	id: __featureName__,
	description: 'Tells you whether the user follows you.',
	screenshot: 'https://user-images.githubusercontent.com/3723666/45190460-03ecc380-b20c-11e8-832b-839959ee2c99.gif',
	include: [
		features.isUserProfile
	],
	exclude: [
		features.isOwnUserProfile
	],
	load: features.onAjaxedPages,
	init
});
