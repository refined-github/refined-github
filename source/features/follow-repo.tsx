import React from 'react';
import {EyeIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import delegate from 'delegate-it';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {releasesOrTagsNavbarSelector} from '../github-helpers/selectors.js';
import api from '../github-helpers/api.js';
import IsFollowingRepo from './follow-repo.gql';

const followRepo = features.getIdentifiers(import.meta.url);

async function addButton(button: HTMLButtonElement): Promise<void> {
	const {repository} = await api.v4(IsFollowingRepo);
	if (repository.viewerSubscription === 'SUBSCRIBED') {
		return;
	}

	button.append(
		<button type="button" className={`btn ${followRepo.class}`}>
			<EyeIcon/> Follow releases
		</button>);
	console.log('✨');
}

function updateSubscription(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {

}

async function init(signal: AbortSignal): Promise<void> {
	await api.expectToken();

	observe(releasesOrTagsNavbarSelector, addButton, {signal});
	delegate(document, followRepo.selector, 'click', updateSubscription, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	init,
});
