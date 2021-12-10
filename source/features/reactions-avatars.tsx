import './reactions-avatars.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
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
	const currentUser = getUsername();
	const users = pageDetect.isReleasesOrTags() ? button.getAttribute('title')! : button.getAttribute('aria-label')!
		.replace(/ reacted with.*/, '')
		.replace(/,? and /, ', ')
		.replace(/, \d+ more/, '')
		.split(', ');

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
		.all(':scope > button:is([aria-label$="emoji"], [title$="emoji"])', commentReactions) // `aria-label` is for PR/issue comments, `title` for releases
		.map(button => getParticipants(button as HTMLButtonElement));
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

function init(): void {
	for (const commentReactions of select.all(selector)) {
		observeReactions(commentReactions);
	}
}

function discussionInit(): void {
	observe(selector, {
		add: observeReactions,
	});
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
	init: onetime(discussionInit),
});
