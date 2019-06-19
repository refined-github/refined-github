import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import {appendBefore} from '../libs/dom-utils';
import optionsStorage, {Options} from '../options-storage';
import {getUsername} from '../libs/utils';

let currentUser: string;

async function getMutedUsers(): Promise<string[]> {
	return (await optionsStorage.getAll() as Options).mutedUsers.split(/\s+/);
}

async function setMutedUsers(mutedUsers: string[]): Promise<void> {
	return optionsStorage.set({mutedUsers: mutedUsers.join(' ')});
}

function minimizeComment(comment: HTMLElement): void {
	if (select.exists('.js-targetable-comment[id^="issue-"]', comment)) {
		return;
	}

	select('.minimized-comment', comment)!.classList.remove('d-none');
	select('.minimized-comment .Details-element', comment)!.removeAttribute('open');
	select('.unminimized-comment', comment)!.classList.add('d-none');
}

function unminimizeComment(comment: HTMLElement): void {
	if (select.exists('.js-targetable-comment[id^="issue-"]', comment)) {
		return;
	}

	select('.minimized-comment', comment)!.classList.add('d-none');
	select('.minimized-comment .Details-element', comment)!.setAttribute('open', 'true');
	select('.unminimized-comment', comment)!.classList.remove('d-none');
}

async function onMuteUnmuteClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	let mutedUsers = await getMutedUsers();

	const comment = (event.target as HTMLElement).closest('.js-comment-container')!;
	const viewportOffset = comment.getBoundingClientRect().top;
	const user = select('.author', comment)!.textContent!;

	if (mutedUsers.includes(user)) {
		mutedUsers = mutedUsers.filter(mutedUser => mutedUser !== user);
	} else {
		mutedUsers.push(user);
	}

	await setMutedUsers(mutedUsers);

	const avatars = select.all(`.js-discussion .js-comment-container .avatar[alt="@${user}"`);
	const comments = avatars.map(avatar => avatar.closest('.js-comment-container') as HTMLElement);

	for (const comment of comments) {
		if (mutedUsers.includes(user)) {
			minimizeComment(comment);
		} else {
			unminimizeComment(comment);
		}
	}

	requestAnimationFrame(() => {
		const newOffset = comment.getBoundingClientRect().top;
		window.scrollBy(0, newOffset - viewportOffset);
	});
}

async function handleMenuOpening(event: DelegateEvent): Promise<void> {
	const mutedUsers = await getMutedUsers();
	const dropdown = select('.show-more-popover', event.delegateTarget.parentElement!)!;
	const user = select('.author', dropdown.closest('.js-comment-container')!)!.textContent!;

	const existingButton = select('.rgh-mute-unmute-button', event.delegateTarget.parentElement!);
	if (existingButton) {
		if (mutedUsers.includes(user)) {
			existingButton.textContent = 'Unmute user';
		} else {
			existingButton.textContent = 'Mute user';
		}

		return;
	}

	if (user === currentUser) {
		return;
	}

	const isMutedUser = mutedUsers.includes(user);

	// Add option to mute or unmute user
	appendBefore(dropdown, 'a[data-ga-click^="Report"]',
		<button
			className="dropdown-item btn-link rgh-mute-unmute-button"
			role="menuitem"
			title={`${isMutedUser ? 'Unmute' : 'Mute'} this user`}
			onClick={onMuteUnmuteClick}>
			{isMutedUser ? 'Unmute' : 'Mute'} user
		</button>
	);
}

async function minimizeMutedUserComments(): Promise<void> {
	const mutedUsers = await getMutedUsers();

	for (const comment of select.all('.js-discussion .js-comment-container')) {
		const user = select('.author', comment)!.textContent!;

		// If the user _is_ muted, minimize their comment
		if (mutedUsers.includes(user) && user !== currentUser) {
			minimizeComment(comment);
		}
	}
}

function init(): void {
	currentUser = getUsername();
	minimizeMutedUserComments();

	delegate('.timeline-comment-action', 'click', handleMenuOpening);
}

features.add({
	id: 'mute-users',
	description: 'Mute users to minimize comments from them',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
