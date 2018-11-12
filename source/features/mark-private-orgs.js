import select from 'select-dom';
import {getUsername} from '../libs/utils';
import * as icons from '../libs/icons';
import * as api from '../libs/api';

export default async function () {
	const publicOrgs = await api.v3(`users/${getUsername()}/orgs`);

	// Select organization avatars except public ones
	const orgSelector = '.avatar-group-item[data-hovercard-type="organization"]';
	const privateOrgSelector = orgSelector + publicOrgs
		.map(orgData => `:not([href="/${orgData.login}"])`)
		.join('');

	for (const org of select.all(privateOrgSelector)) {
		org.classList.add('rgh-private-org');
		org.append(icons.privateLockFilled());
	}
}
