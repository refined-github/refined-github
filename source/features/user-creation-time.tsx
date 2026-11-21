import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import Clock from 'octicons-plain-react/Clock';
import {$optional, elementExists} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';

const userCreationTime = new CachedFunction('user-creation-time', {
	async updater(user: string): Promise<string> {
		const response = await api.v3(`/users/${user}`);
		return response.created_at;
	},
	maxAge: {days: 365},
});

async function init(): Promise<void> {
	const vcard = $optional('.user-profile-bio ~ .vcard-details');
	if (!vcard || elementExists('[title="Member since"]', vcard)) return;

	const username = location.pathname.slice(1);
	const createdAt = await userCreationTime.get(username);
	const date = new Date(createdAt);

	vcard.append(
		<li title="Member since" className="vcard-detail pt-1">
			<Clock />
			<span>
				{'Joined '}
				<relative-time dateTime={date.toISOString()}>
					{date.toLocaleDateString()}
				</relative-time>
			</span>
		</li>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfile,
	],
	init,
});
