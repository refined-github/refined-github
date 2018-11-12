import select from 'select-dom';
import {getUsername} from '../libs/utils';
import * as icons from '../libs/icons';
import * as api from '../libs/api';

export default async function () {
	let publicOrgs = await api.v3(`users/${getUsername()}/orgs`);
	publicOrgs = publicOrgs.map(orgData => `/${orgData.login}`);

	for (const org of select.all('.avatar-group-item[data-hovercard-type="organization"]')) {
		if (!publicOrgs.includes(org.pathname)) {
			org.classList.add('rgh-private-org');
			org.append(icons.privateLockFilled());
		}
	}
}
