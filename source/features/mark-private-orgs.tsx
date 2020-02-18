import './mark-private-orgs.css';
import select from 'select-dom';
import eyeClosedIcon from 'octicon/eye-closed.svg';
import {getUsername} from '../libs/utils';
import features from '../libs/features';
import * as api from '../libs/api';

async function init(): Promise<false | void> {
	const orgs = select.all<HTMLAnchorElement>('.avatar-group-item[data-hovercard-type="organization"]');
	if (orgs.length === 0) {
		return false;
	}

	const response = await api.v3(`users/${getUsername()}/orgs`);
	const publicOrgs: string[] = response.map((orgData: AnyObject) => `/${orgData.login as string}`);

	for (const org of orgs) {
		if (!publicOrgs.includes(org.pathname)) {
			org.classList.add('rgh-private-org');
			org.append(eyeClosedIcon());
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Marks private organizations on your own profile.',
	screenshot: 'https://user-images.githubusercontent.com/6775216/44633467-d5dcc900-a959-11e8-9116-e6b0ffef66af.png',
	include: [
		features.isOwnUserProfile
	],
	load: features.onAjaxedPages,
	init
});
