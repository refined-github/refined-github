import './mark-private-orgs.css';
import select from 'select-dom';
import {getUsername} from '../libs/utils';
import features from '../libs/features';
import * as icons from '../libs/icons';
import * as api from '../libs/api';

async function init(): Promise<false | void> {
	const orgs = select.all<HTMLAnchorElement>('.avatar-group-item[data-hovercard-type="organization"]');
	if (orgs.length === 0) {
		return false;
	}

	let publicOrgs = await api.v3(`users/${getUsername()}/orgs`);
	publicOrgs = publicOrgs.map((orgData: AnyObject) => `/${orgData.login}`);

	for (const org of orgs) {
		if (!publicOrgs.includes(org.pathname)) {
			org.classList.add('rgh-private-org');
			org.append(icons.privateLockFilled());
		}
	}
}

features.add({
	id: 'mark-private-orgs',
	description: 'Mark private organizations on your own profile',
	include: [
		features.isOwnUserProfile
	],
	load: features.onAjaxedPages,
	init
});
