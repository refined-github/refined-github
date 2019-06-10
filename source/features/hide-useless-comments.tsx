import './hide-useless-comments.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {appendBefore} from '../libs/dom-utils';
import optionsStorage, {Options} from '../options-storage';

function hideUselessComments(): void {
	let uselessCount = 0;
	for (const commentText of select.all('.comment-body > p:only-child')) {
		// Find useless comments
		if (!/^([+-]\d+!*|👍|🙏|👎|👌|)+$/.test(commentText.textContent!.trim())) {
			continue;
		}

		// Comments that contain useful images shouldn't be removed
		if (select.exists('a img', commentText)) {
			continue;
		}

		// Ensure that they're not by VIPs (owner, collaborators, etc)
		const comment = commentText.closest('.js-timeline-item') as HTMLElement;
		if (select.exists('.timeline-comment-label', comment)) {
			continue;
		}

		// If the person is having a conversation, then don't hide it
		const author = select('.author', comment)!.getAttribute('href');
		// If the first comment left by the author isn't a useless comment
		// (previously hidden or about to be hidden), then leave this one as well
		const previousComment = select(`.js-timeline-item:not([hidden]) .unminimized-comment .author[href="${author}"]`);
		if (previousComment && previousComment.closest('.js-timeline-item') !== comment) {
			continue;
		}

		comment.hidden = true;
		comment.classList.add('rgh-hidden-comment');
		uselessCount++;
	}

	if (uselessCount > 0) {
		select('.discussion-timeline-actions')!.prepend(
			<p className="rgh-useless-comments-note">
				{`${uselessCount} unhelpful comment${uselessCount > 1 ? 's were' : ' was'} automatically hidden. `}
				<button className="btn-link text-emphasized" onClick={unhideUselessComments}>Show</button>
			</p>
		);
	}
}

function unhideUselessComments(event: React.MouseEvent<HTMLButtonElement>): void {
	for (const comment of select.all('.rgh-hidden-comment')) {
		comment.hidden = false;
	}

	select('.rgh-hidden-comment')!.scrollIntoView();
	event.currentTarget.parentElement!.remove();
}

async function getMutedUsers(): Promise<string[]> {
	return ((await optionsStorage.getAll() as Options).mutedUsers).split(' ');
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
	select('.minimized-comment .Details-element', comment)!.removeAttribute('open');
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
			for (const button of select.all('.rgh-mute-unmute-button', comment)) {
				button.textContent = 'Unmute user';
			}
		} else {
			unminimizeComment(comment);
			for (const button of select.all('.rgh-mute-unmute-button', comment)) {
				button.textContent = 'Mute user';
			}
		}
	}

	requestAnimationFrame(() => {
		const newOffset = comment.getBoundingClientRect().top;
		window.scrollBy(0, newOffset - viewportOffset);
	});
}

async function minimizeMutedUserComments(): Promise<void> {
	const mutedUsers = await getMutedUsers();

	const comments = select.all('.js-discussion .js-comment-container');
	for (const comment of comments) {
		const user = select('.author', comment)!.textContent!;
		const isMutedUser = mutedUsers.includes(user);

		const dropdowns = select.all('.show-more-popover', comment);
		for (const dropdown of dropdowns) {
			// Add option to mute or unmute user
			appendBefore(dropdown, 'a[data-ga-click^="Report"]',
				<button
					className="dropdown-item btn-link rgh-mute-unmute-button"
					role="menuitem"
					title="Browse repository like it appeared on this day"
					onClick={onMuteUnmuteClick}>
					{isMutedUser ? 'Unmute' : 'Mute'} user
				</button>
			);
		}

		// If the use _is_ muted, minimize their comment
		if (isMutedUser) {
			minimizeComment(comment);
		}
	}
}

function init(): void {
	hideUselessComments();
	minimizeMutedUserComments();
}

features.add({
	id: 'hide-useless-comments',
	description: 'Hide useless comments like "+1"',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
