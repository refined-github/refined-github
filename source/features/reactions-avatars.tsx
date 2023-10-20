import './reactions-avatars.css';
import React from 'dom-chef';
import {$$} from 'select-dom';
import {flatZip} from 'flat-zip';
import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {getUsername} from '../github-helpers/index.js';
import getUserAvatar from '../github-helpers/get-user-avatar.js';
import onAbort from '../helpers/abort-controller.js';

const arbitraryAvatarLimit = 36;
const approximateHeaderLength = 3; // Each button header takes about as much as 3 avatars
const avatarSize = 16;

type Participant = {
	button: HTMLButtonElement;
	username: string;
	imageUrl: string;
};

function getParticipants(button: HTMLButtonElement): Participant[] {
	// The list of people who commented is in an adjacent `<tool-tip>` element #5698
	const users = button.nextElementSibling!
		.textContent
		.replace(/ reacted with.*/, '')
		.replace(/,? and /, ', ')
		.replace(/, \d+ more/, '')
		.split(', ');

	const currentUser = getUsername();
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
	const reactionTypes = $$('.social-reaction-summary-item', commentReactions).length;
	const avatarLimit = arbitraryAvatarLimit - (reactionTypes * approximateHeaderLength);

	const participantByReaction
		= $$(':scope > button.social-reaction-summary-item', commentReactions)
			.map(button => getParticipants(button));
	const flatParticipants = flatZip(participantByReaction, avatarLimit);

	for (const {button, username, imageUrl} of flatParticipants) {
		button.append(
			<span className="avatar-user avatar rgh-reactions-avatar p-0 flex-self-center">
				<img src={imageUrl} className="d-block" width={avatarSize} height={avatarSize} alt={`@${username}`}/>
			</span>,
		);
	}
}

function observeCommentReactions(commentReactions: Element): void {
	viewportObserver.observe(commentReactions);
}

function init(signal: AbortSignal): void {
	observe('.has-reactions .js-comment-reactions-options', observeCommentReactions, {signal});
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

https://github.com/refined-github/refined-github/pull/4119
https://github.com/parcel-bundler/parcel/discussions/6490
https://github.com/orgs/community/discussions/11202

*/
