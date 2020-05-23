import './reactions-avatars.css';
import React from 'dom-chef';
import select from 'select-dom';
import {flatZip} from 'flat-zip';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element';
import {getUsername, isFirefox} from '../github-helpers';
import {observeOneMutation} from '../helpers/simplified-element-observer';

const arbitraryAvatarLimit = 36;
const approximateHeaderLength = 3; // Each button header takes about as much as 3 avatars

type Participant = {
	container: HTMLElement;
	username: string;
	imageUrl: string;
};

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
	commentReactions.firstElementChild!.dispatchEvent(new MouseEvent('mouseenter'));
	await observeOneMutation(commentReactions.firstElementChild!, {
		attributes: true,
		attributeFilter: [
			'aria-label'
		]
	});

	const avatarLimit = arbitraryAvatarLimit - (commentReactions.children.length * approximateHeaderLength);

	const participantByReaction = select
		.all(':scope > button', commentReactions)
		.map(getParticipants);
	const flatParticipants = flatZip(participantByReaction, avatarLimit);

	for (const {container, username, imageUrl} of flatParticipants) {
		container.append(
			// Without this, Firefox will follow the link instead of submitting the reaction button
			<a href={isFirefox ? undefined : `/${username}`}>
				<img src={imageUrl}/>
			</a>
		);
	}

	const trackableElement = commentReactions.closest<HTMLElement>('.js-updatable-content')!;
	const trackingSelector = `[data-url="${trackableElement.dataset.url!}"]`;
	onReplacedElement(trackingSelector, init);
}

const viewportObserver = new IntersectionObserver(changes => {
	for (const change of changes) {
		if (change.isIntersecting) {
			showAvatarsOn(change.target);
			viewportObserver.unobserve(change.target);
		}
	}
});

async function init(): Promise<void> {
	for (const commentReactions of select.all('.has-reactions .comment-reactions-options:not(.rgh-reactions)')) {
		commentReactions.classList.add('rgh-reactions');
		viewportObserver.observe(commentReactions);
	}
}

features.add({
	id: __filebasename,
	description: 'Adds reaction avatars showing *who* reacted to a comment',
	screenshot: 'https://user-images.githubusercontent.com/1402241/34438653-f66535a4-ecda-11e7-9406-2e1258050cfa.png'
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
