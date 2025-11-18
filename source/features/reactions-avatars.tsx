import './reactions-avatars.css';

import React from 'dom-chef';
import {$$} from 'select-dom';
import {flatZip} from 'flat-zip';
import * as pageDetect from 'github-url-detection';

import {onAbort} from 'abort-utils';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {getLoggedInUser} from '../github-helpers/index.js';
import getUserAvatar from '../github-helpers/get-user-avatar.js';

const arbitraryAvatarLimit = 36;
const approximateHeaderLength = 3; // Each button header takes about as much as 3 avatars
const avatarSize = 16;

type Participant = {
	button: HTMLButtonElement;
	username: string;
	imageUrl: string;
};

function getParticipants(button: HTMLButtonElement): Participant[] {
	let users;

	if (button.getAttribute('role') === 'switch') { // [aria-label] alone is not a differentiator
		users = button.nextElementSibling!
			.textContent
			.replace(/.*including /, '')
			.replace(/\)/, '')
			.replace(/,? and /, ', ')
			.replace(/, \d+ more/, '')
			.split(', ');
	} else if (button.nextElementSibling?.tagName === 'TOOL-TIP') {
		// The list of people who commented is in an adjacent `<tool-tip>` element #5698
		users = button.nextElementSibling
			.textContent
			.replace(/ reacted with.*/, '')
			.replace(/,? and /, ', ')
			.replace(/, \d+ more/, '')
			.split(', ');
	} else {
		throw new Error('Unknown reaction button layout');
	}

	const currentUser = getLoggedInUser();
	const participants = [];
	for (const username of users) {
		if (username === currentUser) {
			continue;
		}

		const imageUrl = getUserAvatar(username, avatarSize);
		if (imageUrl) {
			participants.push({button, username, imageUrl});
		}
	}

	return participants;
}

const viewportObserver = new IntersectionObserver(changes => {
	for (const change of changes) {
		if (change.isIntersecting) {
			showAvatarsOn(change.target);
			viewportObserver.unobserve(change.target);
		}
	}
}, {
	// Start loading a little before they become visible
	rootMargin: '500px',
});

function showAvatarsOn(commentReactions: Element): void {
	const reactions = $$([
		'button[aria-pressed]', // Discussions, releases, PRs, old issues
		'button[aria-checked]', // React issues
	], commentReactions)
		.map(button => getParticipants(button)); // Get all participants for each reaction
	const avatarLimit = arbitraryAvatarLimit - (reactions.length * approximateHeaderLength);
	const flatParticipants = flatZip(reactions, avatarLimit);

	for (const {button, username, imageUrl} of flatParticipants) {
		button.append(
			<span className="avatar-user avatar rgh-reactions-avatar p-0 flex-self-center">
				<img src={imageUrl} className="d-block" width={avatarSize} height={avatarSize} alt={`@${username}`} loading="lazy" />
			</span>,
		);
	}
}

function observeCommentReactions(commentReactions: Element): void {
	viewportObserver.observe(commentReactions);
}

function init(signal: AbortSignal): void {
	observe([
		// `batch-deferred-content` means the participant list hasn't loaded yet
		'.has-reactions .js-comment-reactions-options:not(batch-deferred-content .js-comment-reactions-options)',
		'[aria-label="Reactions"]',
	], observeCommentReactions, {signal});
	onAbort(signal, viewportObserver);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
		pageDetect.isReleasesOrTags,
		pageDetect.isSingleReleaseOrTag,
		pageDetect.isDiscussion,
	],
	init,
});

/*
Test URLs

- PR: https://github.com/refined-github/refined-github/pull/4119
- Locked PR: https://github.com/refined-github/refined-github/pull/975
- Discussion: https://github.com/parcel-bundler/parcel/discussions/6490
- Locked discussion: https://github.com/orgs/community/discussions/28776
- Deferred participants loading: https://github.com/orgs/community/discussions/30093
- Releases: https://github.com/refined-github/refined-github/releases

*/
