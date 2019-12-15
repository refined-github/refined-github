import './mark-private-orgs.css';
import select from 'select-dom';
import React from 'dom-chef';
import {getUsername} from '../libs/utils';
import features from '../libs/features';
import * as api from '../libs/api';

async function init(): Promise<false | void> {
	const orgs = select.all<HTMLAnchorElement>('.avatar-group-item[data-hovercard-type="organization"]');
	if (orgs.length === 0) {
		return false;
	}

	const response = await api.v3(`users/${getUsername()}/orgs`);
	const publicOrgs: string[] = response.map((orgData: AnyObject) => `/${orgData.login}`);

	for (const org of orgs) {
		if (!publicOrgs.includes(org.pathname)) {
			org.classList.add('rgh-private-org');
			org.append(
				<svg className="octicon octicon-lock" width="14" height="16" aria-title="Private organization">
					<path d="M11.88 5.86h-.3V4.58a4.58 4.58 0 0 0-9.16 0v1.28h-.3A1.66 1.66 0 0 0 .46 7.51v6.83A1.66 1.66 0 0 0 2.12 16h9.76a1.66 1.66 0 0 0 1.66-1.66V7.51a1.66 1.66 0 0 0-1.66-1.65zM5.54 4.58a1.47 1.47 0 0 1 2.94 0v1.28H5.54zm5.66 3.61v5.47H3.78V8.19z" fill="#fff" />
					<path d="M11.88 6.54h-1v-2a3.9 3.9 0 0 0-7.8 0v2h-1a1 1 0 0 0-1 1v6.83a1 1 0 0 0 1 1h9.76a1 1 0 0 0 1-1V7.51a1 1 0 0 0-.96-.97zm-7 0v-2a2.15 2.15 0 0 1 4.3 0v2zm7 7.8H3.1V7.51h8.78z" />
					<path d="M3.1 7.51h8.78v6.83H3.1z" fill="#eee" />
					<path d="M5.05 9.46h-1v-1h1zm0 2.93h-1v1h1zm0-2h-1v1h1z" />
				</svg>
			);
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
