import React from 'dom-chef';
import {elementExists} from 'select-dom';
import {$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import IconLoading from '../github-helpers/icon-loading.js';

function closeModal({delegateTarget: button}: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	button.append(' ', <IconLoading className="v-align-middle" />);
	button.disabled = true;
}

function addConvertToDraftButton(alternativeActions: Element): void {
	const existingButton = $optional('[data-url$="/convert_to_draft"]');
	// Needs to check the existence of both to guarantee the non-draft state
	if (!existingButton || elementExists('[action$="/ready_for_review"]')) {
		return;
	}

	const convertToDraft = existingButton.closest('details')!.cloneNode(true);
	$('.Link--muted', convertToDraft).classList.remove('Link--muted');
	alternativeActions.prepend(convertToDraft);
}

function init(signal: AbortSignal): void {
	// Immediately close lightbox after click instead of waiting for the ajaxed widget to refresh
	delegate('.js-convert-to-draft', 'click', closeModal, {signal});

	// Copy button to mergeability box
	observe('.alt-merge-options', addConvertToDraftButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});

/*

Test URLs:

1. Visit https://github.com/pulls
2. Open any PRs that aren't already drafts

*/
