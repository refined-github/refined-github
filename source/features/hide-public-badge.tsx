import onetime from 'onetime';
import {observe} from 'selector-observer';

import features from '.';
import {upperCaseFirst} from '../github-helpers';

function init(): void {
	observe('[itemprop^="name"] + .Label, .pinned-item-list-item-content .Label, .Popover .f5 + .Label', {
		constructor: HTMLElement,
		add(badge) {
			const newText = badge.textContent!.replace(/Public ?/, '');

			if (newText === '') {
				badge.hidden = true;
			} else {
				badge.textContent = upperCaseFirst(newText);
			}
		},
	});
}

void features.add(__filebasename, {
	awaitDomReady: false,
	init: onetime(init),
});
