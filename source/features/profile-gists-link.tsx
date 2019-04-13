import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getCleanPathname} from '../libs/utils';
import {isEnterprise} from '../libs/page-detect';

async function init(): Promise<false | void> {
	const container = select('body.page-profile .UnderlineNav-body');

	if (!container) {
		return false;
	}

	const username = getCleanPathname();
	const href = isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;
	const link = <a href={href} className="UnderlineNav-item" role="tab" aria-selected="false">Gists </a>;
	container.append(link);

	const userData = await api.v3(`users/${username}`);
	if (userData.public_gists) {
		link.append(<span className="Counter">{userData.public_gists}</span>);
	}
}

features.add({
	id: 'profile-gists-link',
	include: [
		features.isUserProfile
	],
	load: features.onAjaxedPages,
	init
});
