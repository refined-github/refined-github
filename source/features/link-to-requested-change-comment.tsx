import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	observe('div.js-merge-message-container', {
		constructor: HTMLDivElement,
		add(messageContainer) {
			for (const reviewItem of select.all('.merge-status-item.review-item', messageContainer)) {
				const comment = select<HTMLAnchorElement>('.review-status-item details details-menu a', reviewItem)!;
				wrap(reviewItem, <a href={comment.href}/>);
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
