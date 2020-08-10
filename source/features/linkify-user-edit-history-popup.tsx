import React from 'dom-chef';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	observe('details-dialog .Box-header .mr-3 > img:not([alt*="[bot]"])', {
		constructor: HTMLImageElement,
		add(avatar) {
			const userName = avatar.alt.slice(1);
			// Linkify name first
			wrap(avatar.nextElementSibling!, <a className="link-gray-dark" href={`/${userName}`}/>);

			// Then linkify avatar
			wrap(avatar, <a href={`/${userName}`}/>);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Linkifies the username in the edit history popup.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/88917988-9ebb7480-d260-11ea-8690-0a3440f1ebbc.png'
}, {
	init,
	include: [
		pageDetect.isIssue,
		pageDetect.isPRConversation
	],
	repeatOnAjax: false
});
