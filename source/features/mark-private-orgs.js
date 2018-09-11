import {h} from 'dom-chef';
import select from 'select-dom';
import {getUsername} from '../libs/utils';
import * as icons from '../libs/icons';
import api from '../libs/api';

export default async function () {
	// List public orgs
	const publicOrgs = [];
	const orgDataList = await api(`users/${getUsername()}/orgs`);
	if (!orgDataList) {
		return;
	}
	for (const orgData of orgDataList) {
		publicOrgs.push(`/${orgData.login}`);
	}

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

		// Display the lock icon on private orgs
		if (!publicOrgs.includes(orgPath)) {
			orgAvatar.append(
				<span class="profile-org-private-lock">
					{icons.privateLockFilled(15)}
				</span>
			);
		}
	}
}
