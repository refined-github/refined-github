import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname} from '../libs/page-detect';
import {getUsername} from '../libs/utils';
import * as icons from '../libs/icons';
import api from '../libs/api';

export default async () => {
	if (!getCleanPathname().startsWith(getUsername())) {
		// Only for own user
		return;
	}
	// List public orgs
	const publicOrgs = [];
	const orgDataList = await api(`users/${getUsername()}/orgs`, true);
	if (!orgDataList) {
		return;
	}
	for (const orgData of orgDataList) {
		publicOrgs.push('/' + orgData.login);
	}

	// Display
	const userContainer = select('[itemtype="http://schema.org/Person"]');
	if (!userContainer) {
		return;
	}
	// Find all org avatars
	const orgAvatars = select.all('[itemprop="follows"]', userContainer);
	for (const orgAvatar of orgAvatars) {
		// Check if org is private
		const orgPath = orgAvatar.getAttribute('href');
		if (!orgPath) {
			continue;
		}
		if (!publicOrgs.includes(orgPath)) {
			orgAvatar.append(
				<span className={'profile-org-private-lock'}>
					{icons.privateLockFilled()}
				</span>
			);
		}
	}
};
