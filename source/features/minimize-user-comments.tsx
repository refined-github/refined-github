import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import {appendBefore} from '../libs/dom-utils';
import optionsStorage, {Options} from '../options-storage';
import {getUsername} from '../libs/utils';
import onNewComments from '../libs/on-new-comments';
import anchorScroll from '../libs/anchor-scroll';

const getLabel = (maximize: boolean): string => `${maximize ? 'Maximize' : 'Minimize'} user’s comments`;

async function getMinimizedUsers(): Promise<string[]> {
	return (await optionsStorage.getAll() as Options)
		.minimizedUsers
		.split(/\s+/)
		.filter(Boolean);
}

async function setMinimizedUsers(minimizedUsers: string[]): Promise<void> {
	return optionsStorage.set({minimizedUsers: minimizedUsers.join(' ')});
}

function toggleComment(comment: HTMLElement, minimize: boolean): void {
	if (comment.id.startsWith('issue-')) {
		return;
	}

	select('.unminimized-comment', comment)!.classList.toggle('d-none', minimize);
	select('.minimized-comment', comment)!.classList.toggle('d-none', !minimize);
	select('.minimized-comment .Details-element', comment)!.toggleAttribute('open', !minimize);
}

async function onButtonClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	const comment = event.currentTarget.closest('.js-comment-container')!;
	const user = select('.author', comment)!.textContent!;

	let minimizedUsers = await getMinimizedUsers();
	if (minimizedUsers.includes(user)) {
		minimizedUsers = minimizedUsers.filter(mutedUser => mutedUser !== user);
	} else {
		minimizedUsers.push(user);
	}

	await setMinimizedUsers(minimizedUsers);
	anchorScroll(minimizeMutedUserComments, comment);
}

async function handleMenuOpening(event: DelegateEvent): Promise<void> {
	const dropdown = event.delegateTarget.nextElementSibling!;
	const user = dropdown
		.closest('.js-comment-container')!
		.querySelector('.author')!
		.textContent!;

	if (user === getUsername()) {
		return;
	}

	const minimizedUsers = await getMinimizedUsers();
	const shouldMinimizeComment = minimizedUsers.includes(user);

	const existingButton = select('.rgh-minimize-user-comments-button', dropdown);
	if (existingButton) {
		existingButton.textContent = getLabel(shouldMinimizeComment);
		return;
	}

	// Add option to mute or unmute user
	appendBefore(dropdown, 'a[data-ga-click^="Report"]',
		<button
			className="dropdown-item btn-link rgh-minimize-user-comments-button"
			role="menuitem"
			title={`${shouldMinimizeComment ? 'Maximize' : 'Minimize'} comments from this user`}
			type="button"
			onClick={onButtonClick}>
			{getLabel(shouldMinimizeComment)}
		</button>
	);
}

async function minimizeMutedUserComments(): Promise<void> {
	const minimizedUsers = await getMinimizedUsers();

	for (const comment of select.all('.js-discussion .js-minimizable-comment-group')) {
		const user = select('.author', comment)!.textContent!;
		toggleComment(comment, minimizedUsers.includes(user));
	}
}

function init(): void {
	minimizeMutedUserComments();
	onNewComments(minimizeMutedUserComments);
	delegate('.timeline-comment-action', 'click', handleMenuOpening);
}

features.add({
	id: __featureName__,
	description: 'Minimize comments for users you don’t want to see',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
