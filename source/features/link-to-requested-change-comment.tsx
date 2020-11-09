import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import features from '.';
import { wrap } from '../helpers/dom-utils';

function init(): void {
	for (const reviewItem of select.all('.merge-status-item.review-item')) {
		const comment = select<HTMLAnchorElement>('.review-status-item details details-menu a', reviewItem)!;
		wrap(reviewItem, <a href={comment.href}/>);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	awaitDomReady: false,
	init
});
