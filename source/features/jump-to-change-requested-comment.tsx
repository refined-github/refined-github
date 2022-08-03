import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import observe from '../helpers/selector-observer';

function init(signal: AbortSignal): void {
	observe(
		'.review-item a.dropdown-item[href^="#pullrequestreview-"])',
		messageContainer => {
			const element = select('.review-status-item div[title*="requested changes"]')?.lastChild;

			if (element) {
				wrap(element, <a href={messageContainer.href}/>);
			}
		},
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
