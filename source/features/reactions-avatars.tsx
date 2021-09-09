import './reactions-avatars.css';
import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import select from 'select-dom';
import {flatZip} from 'flat-zip';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element';
import {getUsername} from '../github-helpers';

const arbitraryAvatarLimit = 36;
const approximateHeaderLength = 3; // Each button header takes about as much as 3 avatars

interface Participant {
	button: HTMLButtonElement;
	imageUrl: string;
}

function getParticipants(button: HTMLButtonElement): Participant[] {
	const currentUser = getUsername();
	const users = button.getAttribute('aria-label')!
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
			participants.push({button, imageUrl: existingAvatar.src});
			continue;
		}

		// If it's not a bot, use a shortcut URL #2125
		if (cleanName === username) {
			const imageUrl = `/${username}.png?size=${window.devicePixelRatio * 20}`;
			participants.push({button, imageUrl});
		}
	}

	return participants;
}

async function showAvatarsOn(commentReactions: Element): Promise<void> {
	const avatarLimit = arbitraryAvatarLimit - (commentReactions.children.length * approximateHeaderLength);

	const participantByReaction = select
		.all(':scope > button[aria-label$="emoji"]', commentReactions)
		.map(button => getParticipants(button));
	const flatParticipants = flatZip(participantByReaction, avatarLimit);

	for (const {button, imageUrl} of flatParticipants) {
		button.append(
			<span className="rounded-1 avatar-user avatar rgh-reactions-avatar">
				<img src={imageUrl} className="avatar-user rounded-1"/>
			</span>,
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
	rootMargin: '500px',
});

function init(): void {
	observe('.has-reactions .comment-reactions-options:not(.rgh-reactions)', {
		add(commentReactions) {
			commentReactions.classList.add('rgh-reactions');
			viewportObserver.observe(commentReactions);
		},
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments,
		pageDetect.isDiscussion,
		pageDetect.isReleasesOrTags,
	],
	init: onetime(init),
});
