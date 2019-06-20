import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import {appendBefore} from '../libs/dom-utils';
import optionsStorage, {Options} from '../options-storage';
import {getUsername} from '../libs/utils';
import onNewComments from '../libs/on-new-comments';

async function getMutedUsers(): Promise<string[]> {
	return (await optionsStorage.getAll() as Options).mutedUsers.split(/\s+/).filter(Boolean);
}

async function setMutedUsers(mutedUsers: string[]): Promise<void> {
	return optionsStorage.set({mutedUsers: mutedUsers.join(' ')});
}

function toggleComment(comment: HTMLElement, minimize: boolean): void {
	if (comment.id.startsWith('issue-')) {
		return;
	}

	select('.minimized-comment', comment)!.classList[minimize ? 'remove' : 'add']('d-none');
	select('.minimized-comment .Details-element', comment)![minimize ? 'removeAttribute' : 'setAttribute']('open', 'true');
	select('.unminimized-comment', comment)!.classList[minimize ? 'add' : 'remove']('d-none');
}

async function onMuteUnmuteClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	const comment = event.currentTarget.closest('.js-comment-container')!;
	const viewportOffset = comment.getBoundingClientRect().top;
	const user = select('.author', comment)!.textContent!;

	let mutedUsers = await getMutedUsers();
	if (mutedUsers.includes(user)) {
		mutedUsers = mutedUsers.filter(mutedUser => mutedUser !== user);
	} else {
		mutedUsers.push(user);
	}

	await setMutedUsers(mutedUsers);
	await minimizeMutedUserComments();

	requestAnimationFrame(() => {
		const newOffset = comment.getBoundingClientRect().top;
		window.scrollBy(0, newOffset - viewportOffset);
	});
}

async function handleMenuOpening(event: DelegateEvent): Promise<void> {
	const dropdown = select('.show-more-popover', event.delegateTarget.parentElement!)!;
	const user = select('.author', dropdown.closest('.js-comment-container')!)!.textContent!;

	if (user === getUsername()) {
		return;
	}

	const mutedUsers = await getMutedUsers();
	const isMutedUser = mutedUsers.includes(user);

	const existingButton = select('.rgh-mute-unmute-button', event.delegateTarget.parentElement!);
	if (existingButton) {
		if (isMutedUser) {
			existingButton.textContent = 'Unmute user';
		} else {
			existingButton.textContent = 'Mute user';
		}

		return;
	}

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

	for (const comment of select.all('.js-discussion .js-minimizable-comment-group')) {
		const user = select('.author', comment)!.textContent!;

		// If the user _is_ muted, minimize their comment
		if (mutedUsers.includes(user) && user !== getUsername()) {
			toggleComment(comment, true);
		} else {
			toggleComment(comment, false);
		}
	}
}

function init(): void {
	minimizeMutedUserComments();
	onNewComments(minimizeMutedUserComments);

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
