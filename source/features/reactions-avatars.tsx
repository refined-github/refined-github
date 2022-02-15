import './reactions-avatars.css';
import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import {flatZip} from 'flat-zip';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getUsername} from '../github-helpers';
import onElementRemoval from '../helpers/on-element-removal';

const arbitraryAvatarLimit = 36;
const approximateHeaderLength = 3; // Each button header takes about as much as 3 avatars

interface Participant {
	button: HTMLButtonElement;
	username: string;
	imageUrl: string;
}

function getParticipants(button: HTMLButtonElement): Participant[] {
	// Reaction buttons on releases and review comments have the list of people in subsequent `<primer-tooltip>` element instead of `aria-label` #5287
	const tooltip = button.classList.contains('tooltipped')
		? button.getAttribute('aria-label')!
		: button.nextElementSibling!.textContent!;
	const users = tooltip
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

		const cleanName = username.replace('[bot]', '');

		// Find image on page. Saves a request and a redirect + add support for bots
		const existingAvatar = select<HTMLImageElement>(`[alt="@${cleanName}"]`);
		if (existingAvatar) {
			participants.push({button, username, imageUrl: existingAvatar.src});
			continue;
		}

		// If it's not a bot, use a shortcut URL #2125
		if (cleanName === username) {
			const imageUrl = (pageDetect.isEnterprise() ? `/${username}.png` : `https://avatars.githubusercontent.com/${username}`) + '?size=32';
			participants.push({button, username, imageUrl});
		}
	}

	return participants;
}

async function showAvatarsOn(commentReactions: Element): Promise<void> {
	const avatarLimit = arbitraryAvatarLimit - (commentReactions.children.length * approximateHeaderLength);

	const participantByReaction = select
		.all(':scope > button.social-reaction-summary-item', commentReactions)
		.map(button => getParticipants(button));
	const flatParticipants = flatZip(participantByReaction, avatarLimit);

	for (const {button, username, imageUrl} of flatParticipants) {
		button.append(
			<span className="avatar-user avatar rgh-reactions-avatar p-0 flex-self-center">
				<img src={imageUrl} className="d-block" width="16" height="16" alt={`@${username}`}/>
			</span>,
		);
	}

	await onElementRemoval(commentReactions.closest('.comment-reactions')!);
	init();
}

const viewportObserver = new IntersectionObserver(changes => {
	for (const change of changes) {
		if (change.isIntersecting) {
			void showAvatarsOn(change.target);
			viewportObserver.unobserve(change.target);
		}
	}
}, {
	// Start loading a little before they become visible
	rootMargin: '500px',
});

const selector = '.has-reactions .comment-reactions-options:not(.rgh-reactions)';

function observeReactions(commentReactions: Element): void {
	commentReactions.classList.add('rgh-reactions');
	viewportObserver.observe(commentReactions);
}

function init(): Deinit {
	for (const commentReactions of select.all(selector)) {
		observeReactions(commentReactions);
	}

	return viewportObserver.disconnect;
}

function discussionInit(): Deinit[] {
	const observer = observe(selector, {
		add: observeReactions,
	});

	return [
		observer.abort,
		viewportObserver.disconnect,
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
