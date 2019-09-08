import './reactions-avatars.css';
import React from 'dom-chef';
import select from 'select-dom';
import debounce from 'debounce-fn';
import {timerIntervalometer} from 'intervalometer';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

const approximateAvatarCount = 16; // Each row takes about as much as 16 avatars.

type Participant = {
	container: HTMLElement;
	username: string;
	src: string;
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
			participants.push({container, username, src: existingAvatar.src});
			continue;
		}

		// If it's not a bot, use a shortcut URL #2125
		if (cleanName === username) {
			const src = `/${username}.png?size=${window.devicePixelRatio * 20}`;
			participants.push({container, username, src});
		}
	}

	return participants;
}

function add(): void {
	for (const list of select.all('.has-reactions:not(.rgh-reactions) .comment-reactions-options')) {
		const rows = list.children.length >= 4 ? 2 : 1;
		const columnCount = Math.ceil(list.children.length / rows);
		const avatarTotalCount = Math.ceil(approximateAvatarCount / columnCount);

		const participantByReaction = [...list.children as HTMLCollectionOf<HTMLElement>].map(getParticipants);

		for (const flatParticipants of participantByReaction) {
			for (const {container, username, src} of flatParticipants.slice(0, avatarTotalCount)) {
				container.append(
					<a>
						<img src={src} />
					</a>
				);

				// Without this, Firefox will follow the link instead of submitting the reaction button
				if (!navigator.userAgent.includes('Firefox/')) {
					(container.lastElementChild as HTMLAnchorElement).href = `/${username}`;
				}
			}
		}

		list.closest('.has-reactions')!.classList.add('rgh-reactions');

		list.style.gridTemplateColumns = `repeat(${columnCount}, ${100 / columnCount}%)`;
	}
}

function init(): void {
	add();

	// GitHub receives update messages via WebSocket, which seem to trigger
	// a fetch for the updated content. When the content is actually updated
	// in the DOM there are no further events, so we have to look for changes
	// every 300ms for the 3 seconds following the last message.
	// This should be lighter than using MutationObserver on the whole page.
	const updater = timerIntervalometer(add, 300);
	const cancelInterval = debounce(updater.stop, {wait: 3000});
	window.addEventListener('socket:message', () => {
		updater.start();
		cancelInterval();
	});
}

features.add({
	id: __featureName__,
	description: 'Adds reaction avatars showing *who* reacted to a comment',
	screenshot: 'https://user-images.githubusercontent.com/1402241/34438653-f66535a4-ecda-11e7-9406-2e1258050cfa.png',
	include: [
		features.hasComments
	],
	load: features.onNewComments,
	init
});
