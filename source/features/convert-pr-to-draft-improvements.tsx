import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	console.log(112);
	observe('.alt-merge-options:not(.rgh-convert-pr-draft-position)', {
		add(alternativeActions) {
			const existingButton = select('[data-url$="/convert_to_draft"]');
			// Needs to check the existence of both to guarantee the non-draft state
			if (!existingButton || select.exists('[action$="/ready_for_review"]')) {
				return;
			}

			alternativeActions.classList.add('rgh-convert-pr-draft-position');
			const convertToDraft = existingButton.closest('details')!.cloneNode(true);
			select('.muted-link', convertToDraft)!.classList.remove('muted-link');
			alternativeActions.prepend(convertToDraft);
		}
	});
}

void features.add({
	id: __filebasename,
}, {
	include: [
		pageDetect.isPRConversation
	],
	init: onetime(init)
});
