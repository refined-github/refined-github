import {h} from 'dom-chef';
import select from 'select-dom';
import {getUsername} from '../libs/utils';
import * as icons from '../libs/icons';
import * as api from '../libs/api';

export default async function () {
	let publicOrgs = await api.v3(`users/${getUsername()}/orgs`);
	publicOrgs = publicOrgs.map(orgData => `/${orgData.login}`);

	for (const orgAvatar of select.all('.avatar-group-item[data-hovercard-type="organization"]')) {
		const orgPath = orgAvatar.getAttribute('href');
		if (!publicOrgs.includes(orgAvatar.getAttribute('href'))) {
			orgAvatar.classList.add('rgh-private-org');
			orgAvatar.append(icons.privateLock());
		}
	}
}
