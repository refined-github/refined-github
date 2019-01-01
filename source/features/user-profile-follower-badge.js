import {h} from 'dom-chef';
import select from 'select-dom';
import {getUsername} from '../libs/utils';
import * as api from '../libs/api';
import {getCleanPathname, isOwnUserProfile} from '../libs/page-detect';

export default async function () {
	const badge = <div class="follower-badge">Follows you</div>;

	if (isOwnUserProfile()) {
		return;
	}

	const {status} = await api.v3(
		`users/${getCleanPathname()}/following/${getUsername()}`,
		{accept404: true}
	);
	if (status === 204) {
		select('.vcard-names-container.py-3.js-sticky.js-user-profile-sticky-fields').after(badge);
	}
}
