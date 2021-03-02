import React from 'jsx-dom';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	observe('.review-item .dropdown-item[href^="#pullrequestreview-"]:not(.rgh-jump-to-change-requested-comment)', {
		constructor: HTMLAnchorElement,
		add(messageContainer) {
			messageContainer.classList.add('rgh-jump-to-change-requested-comment');
			const element = select('.review-status-item div[title*="requested changes"]')?.lastChild;

			if (element) {
				wrap(element, <a href={messageContainer.href}/>);
			}
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	init: onetime(init)
});
