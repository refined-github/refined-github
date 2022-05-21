import React from 'dom-chef';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): Deinit {
	return observe('details-dialog .Box-header .mr-3 > img:not([alt*="[bot]"])', {
		constructor: HTMLImageElement,
		add(avatar) {
			const userName = avatar.alt.slice(1);
			// Linkify name first
			wrap(avatar.nextElementSibling!, <a className='Link--primary' href={`/${userName}`}/>);

			// Then linkify avatar
			wrap(avatar, <a href={`/${userName}`}/>);
		},
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
