import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import {appendBefore} from '../libs/dom-utils';
import optionsStorage from '../options-storage';
import {getUsername} from '../libs/utils';
import onNewComments from '../libs/on-new-comments';
import anchorScroll from '../libs/anchor-scroll';

const getLabel = (restore: boolean): string => `${restore ? 'Restore' : 'Minimize'} user’s comments`;

function getUsernameFromComment(comment: Element): string {
	return select<HTMLAnchorElement>('.author', comment)!.pathname.slice(1);
}

async function getMinimizedUsers(): Promise<string[]> {
	return (await optionsStorage.getAll()).minimizedUsers.trim().split(/\s+/);
}

async function setMinimizedUsers(minimizedUsers: string[]): Promise<void> {
	return optionsStorage.set({minimizedUsers: minimizedUsers.join(' ')});
}

function toggleComment(comment: HTMLElement, minimize: boolean): void {
	if (comment.id.startsWith('issue-') || comment.id.startsWith('pullrequestreview-')) {
		return;
	}

	select('.unminimized-comment', comment)!.classList.toggle('d-none', minimize);
	select('.minimized-comment', comment)!.classList.toggle('d-none', !minimize);
	select('.minimized-comment .Details-element', comment)!.toggleAttribute('open', !minimize);
}

async function onButtonClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	const comment = event.currentTarget.closest('.js-targetable-comment')!;
	const user = getUsernameFromComment(comment);

	let minimizedUsers = await getMinimizedUsers();
	if (minimizedUsers.includes(user)) {
		minimizedUsers = minimizedUsers.filter(mutedUser => mutedUser !== user);
	} else {
		minimizedUsers.push(user);
	}

	await setMinimizedUsers(minimizedUsers);
	const resetScroll = anchorScroll(comment);
	await minimizeMutedUserComments();
	resetScroll();
}

async function handleMenuOpening(event: DelegateEvent): Promise<void> {
	const dropdown = event.delegateTarget.nextElementSibling as HTMLElement;
	const user = getUsernameFromComment(dropdown.closest('.js-targetable-comment')!);
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
			type="button"
			onClick={onButtonClick}>
			{getLabel(shouldMinimizeComment)}
		</button>
	);

	// The new button's label is too long for the dropdown
	dropdown.style.width = '205px';
}

async function minimizeMutedUserComments(): Promise<void> {
	const minimizedUsers = await getMinimizedUsers();

	for (const comment of select.all('.js-discussion .js-minimizable-comment-group')) {
		const user = getUsernameFromComment(comment);
		toggleComment(comment, minimizedUsers.includes(user));
	}
}

function init(): void {
	minimizeMutedUserComments();
	onNewComments(minimizeMutedUserComments);
	// `summary` excludes the `edit-comments-faster` button
	delegate('summary.timeline-comment-action:not([aria-label="Add your reaction"])', 'click', handleMenuOpening);
}

features.add({
	disabled: '#2298',
	id: __featureName__,
	description: 'Adds ability to minimize comments of certain users.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/61595681-d6d4b400-ac17-11e9-98b9-03f27b004a94.gif',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
