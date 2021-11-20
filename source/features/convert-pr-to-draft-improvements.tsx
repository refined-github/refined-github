import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import IconLoading from '../github-helpers/icon-loading';

function closeModal({delegateTarget: button}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	button.append(' ', <IconLoading className="v-align-middle"/>);
	button.disabled = true;
}

function init(): void {
	// Immediately close lightbox after click instead of waiting for the ajaxed widget to refresh
	delegate(document, '.js-convert-to-draft', 'click', closeModal);

	// Copy button to mergeability box
	observe('.alt-merge-options:not(.rgh-convert-pr-draft-position)', {
		add(alternativeActions) {
			const existingButton = select('[data-url$="/convert_to_draft"]');
			// Needs to check the existence of both to guarantee the non-draft state
			if (!existingButton || select.exists('[action$="/ready_for_review"]')) {
				return;
			}

			alternativeActions.classList.add('rgh-convert-pr-draft-position');
			const convertToDraft = existingButton.closest('details')!.cloneNode(true);
			select('.Link--muted', convertToDraft)!.classList.remove('Link--muted');
			alternativeActions.prepend(convertToDraft);
		},
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	deduplicate: 'has-rgh-inner',
	init: onetime(init),
});
