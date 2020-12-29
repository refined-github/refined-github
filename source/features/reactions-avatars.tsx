import './reactions-avatars.css';
import React from 'dom-chef';
import {flatZip} from 'flat-zip';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element';
import {getUsername, isFirefox} from '../github-helpers';

const arbitraryAvatarLimit = 36;
const approximateHeaderLength = 3; // Each button header takes about as much as 3 avatars

interface Participant {
	container: HTMLElement;
	username: string;
	imageUrl: string;
}

function getParticipants(container: HTMLElement): Participant[] {
	const currentUser = getUsername();
	const users = container.getAttribute('aria-label')!
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
			participants.push({container, username, imageUrl: existingAvatar.src});
			continue;
		}

		// If it's not a bot, use a shortcut URL #2125
		if (cleanName === username) {
			const imageUrl = `/${username}.png?size=${window.devicePixelRatio * 20}`;
			participants.push({container, username, imageUrl});
		}
	}

	return participants;
}

async function showAvatarsOn(commentReactions: Element): Promise<void> {
	const avatarLimit = arbitraryAvatarLimit - (commentReactions.children.length * approximateHeaderLength);

	const participantByReaction = select
		.all(':scope > button', commentReactions)
		.map(getParticipants);
	const flatParticipants = flatZip(participantByReaction, avatarLimit);

	for (const {container, username, imageUrl} of flatParticipants) {
		container.append(
			// Without this, Firefox will follow the link instead of submitting the reaction button
			<a href={isFirefox ? undefined : `/${username}`} className="rounded-1 avatar-user">
				<img src={imageUrl} className="avatar-user rounded-1"/>
			</a>
		);
	}

	const trackableElement = commentReactions.closest<HTMLElement>('[data-body-version]')!;
	const trackingSelector = `[data-body-version="${trackableElement.dataset.bodyVersion!}"]`;
	await onReplacedElement(trackingSelector, init);
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
	rootMargin: '500px'
});

function init(): void {
	for (const commentReactions of $$('.has-reactions .comment-reactions-options:not(.rgh-reactions)')) {
		commentReactions.classList.add('rgh-reactions');
		viewportObserver.observe(commentReactions);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init
});
