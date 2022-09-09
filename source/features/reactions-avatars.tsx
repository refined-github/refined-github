import './reactions-avatars.css';
import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import {flatZip} from 'flat-zip';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getUsername} from '../github-helpers';
import getUserAvatar from '../github-helpers/get-user-avatar';
import onAbort from '../helpers/abort-controller';

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
		.textContent!
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

const resizeObserver = new ResizeObserver(([{target}], observer) => {
	if (!target.isConnected) {
		observer.unobserve(target);
		observeReactions();
	}
});

function showAvatarsOn(commentReactions: Element): void {
	const avatarLimit = arbitraryAvatarLimit - (commentReactions.children.length * approximateHeaderLength);

	const participantByReaction = select
		.all(':scope > button.social-reaction-summary-item', commentReactions)
		.map(button => getParticipants(button));
	const flatParticipants = flatZip(participantByReaction, avatarLimit);

	for (const {button, username, imageUrl} of flatParticipants) {
		button.append(
			<span className="avatar-user avatar rgh-reactions-avatar p-0 flex-self-center">
				<img src={imageUrl} className="d-block" width={avatarSize} height={avatarSize} alt={`@${username}`}/>
			</span>,
		);
	}

	resizeObserver.observe(commentReactions.closest('.comment-reactions')!);
}

// TODO [2022-12-18]: Drop `.comment-reactions-options` (GHE)
const reactionsSelector = '.has-reactions :is(.js-comment-reactions-options, .comment-reactions-options):not(.rgh-reactions)';

function observeReactions(): void {
	for (const commentReactions of select.all(reactionsSelector)) {
		observeCommentReactions(commentReactions);
	}
}

function observeCommentReactions(commentReactions: Element): void {
	commentReactions.classList.add('rgh-reactions');
	viewportObserver.observe(commentReactions);
}

function init(signal: AbortSignal): void {
	observeReactions();
	onAbort(signal, viewportObserver, resizeObserver);
}

function discussionInit(): Deinit {
	return [
		observe(reactionsSelector, {add: observeCommentReactions}),
		viewportObserver,
		resizeObserver,
	];
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
		pageDetect.isReleasesOrTags,
	],
	deduplicate: 'has-rgh-inner',
	init,
}, {
	include: [
		pageDetect.isDiscussion,
	],
	init: discussionInit,
});
