import delegate, {DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

const emojiSortOrder = ['THUMBS_UP', 'THUMBS_DOWN', 'LAUGH', 'HOORAY', 'CONFUSED', 'HEART', 'ROCKET', 'EYES'];

function optimisticReactionFromPost(event: DelegateEvent<MouseEvent>): void {
	const reaction = event.delegateTarget as HTMLButtonElement;
	updateReaction(reaction);
}

function optimisticReactionFromMenu(event: DelegateEvent<MouseEvent>): void {
	const reactionButton = event.delegateTarget as HTMLButtonElement;
	const reactionsMenu = reactionButton.closest('reactions-menu')!;
	const details = reactionsMenu.querySelector('details');
	details!.open = false; // Close reactions menu immediately

	const reactionsContainer = reactionsMenu.nextElementSibling!.querySelector('.js-comment-reactions-options')!;
	const reactionButtonValue = reactionButton.getAttribute('value')!;
	const existingReaction = reactionsContainer.querySelector<HTMLButtonElement>(`[value="${reactionButtonValue}"]`);

	if (existingReaction) {
		// The user is updating an existing reaction via the menu, just update the reaction
		updateReaction(existingReaction);
	} else {
		// Reactions have a specific order, so we need to insert the new reaction in the correct position
		const reactionIndex = emojiSortOrder.findIndex(item => reactionButtonValue.startsWith(item));
		const insertionIndex = [...reactionsContainer.querySelectorAll('button')].findIndex(button => {
			const index = Number.parseInt(button.getAttribute('data-button-index-position')!, 10);
			return index > reactionIndex;
		});
		const referenceNode = reactionsContainer.querySelectorAll('button').item(insertionIndex);
		const emojiElement = reactionButton.querySelector('g-emoji')!.cloneNode(true);
		emojiElement.className = 'social-button-emoji';

		reactionsContainer.insertBefore(
			<>
				<button
					name="input[content]"
					value={reactionButtonValue}
					type="submit"
					className="social-reaction-summary-item btn-link d-flex no-underline flex-items-baseline mr-2 user-has-reacted"
				>
					{emojiElement}
					<span className="js-discussion-reaction-group-count">1</span>
				</button>
				<span/> {/* helps avoid unwanted margin due to adjacent siblings of .social-reaction-summary-item */}
			</>,
			referenceNode,
		);
	}
}

function updateReaction(buttonElement: HTMLButtonElement): void {
	const countElement = buttonElement.querySelector(
		'.js-discussion-reaction-group-count',
	)!;
	const count = Number.parseInt(countElement.textContent, 10);
	const isIncrease = !buttonElement.getAttribute('value')!.endsWith('unreact');
	const newCount = isIncrease ? count + 1 : count - 1;

	if (newCount === 0) {
		buttonElement.setAttribute('hidden', '');
	} else if (newCount > count) {
		countElement.textContent = String(newCount);
		buttonElement.classList.add('user-has-reacted');
		buttonElement.classList.remove('color-fg-muted');
	} else {
		countElement.textContent = String(newCount);
		buttonElement.classList.add('color-fg-muted');
	}
}

function init(signal: AbortSignal): void {
	delegate('reactions-menu + form button[value$=react]', 'click', optimisticReactionFromPost, {signal});
	delegate('reactions-menu button[value$=react]', 'click', optimisticReactionFromMenu, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
		pageDetect.isReleasesOrTags,
		pageDetect.isSingleReleaseOrTag,
		pageDetect.isDiscussion,
	],
	init,
});
