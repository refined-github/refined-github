import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import CheckIcon from 'octicons-plain-react/Check';
import {$, closestElement, closestElementOptional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {withTooltipRef} from '../components/tooltip.js';
import onElementRemoval from '../helpers/on-element-removal.js';
import observe from '../helpers/selector-observer.js';

// GitHub only renders the native resolve form on unresolved conversations the current user is allowed to resolve
const resolveFormSelector = 'form[action$="/resolve"]';

export function getResolvableThread(anchor: HTMLElement): HTMLElement | undefined {
	const thread = closestElementOptional('.js-resolvable-timeline-thread-container', anchor);

	// Skip resolved conversations and any thread without a native resolve action (no permission or non-resolvable)
	if (!thread || thread.dataset.resolved === 'true' || !elementExists(resolveFormSelector, thread)) {
		return undefined;
	}

	return thread;
}

export function resolveConversation(anchor: HTMLElement): void {
	const thread = getResolvableThread(anchor);
	if (!thread) {
		return;
	}

	// Trigger GitHub's native resolve control
	$('button[type="submit"]', $(resolveFormSelector, thread)).click();
}

export async function addQuickResolveButton(menuButton: HTMLButtonElement, {signal}: SignalAsOptions): Promise<void> {
	if (!getResolvableThread(menuButton)) {
		return;
	}

	// The anchor can be replaced by GitHub while leaving the button behind #5572
	if (menuButton.previousElementSibling?.classList.contains('rgh-quick-comment-resolve-button')) {
		return;
	}

	const resolveButton = (
		<button
			ref={withTooltipRef('Resolve conversation')}
			type="button"
			className="Button Button--iconOnly Button--invisible Button--small rgh-quick-comment-resolve-button"
		>
			<CheckIcon />
		</button>
	);
	menuButton.before(resolveButton);
	resolveButton.addEventListener('click', () => {
		resolveConversation(menuButton);
		resolveButton.remove();
	});

	// Remove our button when the kebab button is replaced (React navigation), so it doesn't get duplicated
	await onElementRemoval(menuButton, signal);
	resolveButton.remove();
}

export function addQuickResolveButtonLegacy(commentDropdown: HTMLDetailsElement): void {
	if (!getResolvableThread(commentDropdown)) {
		return;
	}

	// The anchor can be replaced by GitHub while leaving the button behind #5572
	const commentBody = closestElement('.js-comment', commentDropdown);
	if (!commentBody || elementExists('.rgh-quick-comment-resolve-button', commentBody)) {
		return;
	}

	const resolveButton = (
		<button
			type="button"
			role="menuitem"
			className="timeline-comment-action btn-link rgh-quick-comment-resolve-button"
			aria-label="Resolve conversation"
		>
			<CheckIcon />
		</button>
	);
	commentDropdown.before(resolveButton);
	resolveButton.addEventListener('click', () => {
		resolveConversation(commentDropdown);
		resolveButton.remove();
	});
}

function init(signal: AbortSignal): void {
	observe(
		'div:is([class^="IssueBodyHeader"], [data-testid="comment-header"]) '
		+ 'button[data-component="IconButton"]:has(> .octicon-kebab-horizontal)',
		addQuickResolveButton,
		{signal},
	);

	observe(
		'.js-comment .timeline-comment-actions details.position-relative',
		addQuickResolveButtonLegacy,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isLoggedIn,
	],
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles,
	],
	init,
});

/*
Test URLs:

- PR conversation with unresolved review threads: https://github.com/refined-github/refined-github/pull/9902
- PR files with unresolved review threads: https://github.com/refined-github/refined-github/pull/9902/files
- PR with resolved review threads: https://github.com/refined-github/yolo/pull/8

*/
