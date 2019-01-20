import {React} from 'dom-chef/react';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getUsername, getCleanPathname} from '../libs/utils';

async function init() {
	const {status} = await api.v3(
		`users/${getCleanPathname()}/following/${getUsername()}`,
		{accept404: true}
	);

	if (status === 204) {
		select('.vcard-names-container.py-3.js-sticky.js-user-profile-sticky-fields').after(
			<div class="follower-badge">Follows you</div>
		);
	}
}

features.add({
	id: 'user-profile-follower-badge',
	include: [
		features.isUserProfile
	],
	exclude: [
		features.isOwnUserProfile
	],
	load: features.onAjaxedPages,
	init
});
