import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	for (const link of select.all<HTMLAnchorElement>('.js-issue-row a[aria-label*="comment"], .js-pinned-issue-list-item a[aria-label*="comment"]')) {
		link.hash = '#partial-timeline';
	}
}

function initDashboard(): void {
	observe('.js-recent-activity-container :not(a) > div > .octicon-comment', {
		add(icon) {
			const url = icon.closest('li')!.querySelector('a')!.pathname + '#partial-timeline';
			const link = <a className="muted-link" href={url}/>;
			icon.parentElement!.classList.remove('col-1'); // Also fix extra space added by GitHub #3174
			wrapAll(link [icon, icon.nextSibling!]);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Makes the "comment" icon in issue lists link to the latest comment of the issue.',
	screenshot: 'https://user-images.githubusercontent.com/14323370/57962709-7019de00-78e8-11e9-8398-7e617ba7a96f.png'
}, {
	include: [
		pageDetect.isConversationList
	],
	init
}, {
	include: [
		pageDetect.isDashboard
	],
	init: onetime(initDashboard)
});
