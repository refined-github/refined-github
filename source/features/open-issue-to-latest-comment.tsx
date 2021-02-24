import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {wrapAll} from '../helpers/dom-utils';

function init(): void {
	for (const link of select.all('.js-issue-row a[aria-label*="comment"], .js-pinned-issue-list-item a[aria-label*="comment"]')) {
		link.hash = '#partial-timeline';
	}
}

function initDashboard(): void {
	observe('.js-recent-activity-container :not(a) > div > .octicon-comment', {
		add(icon) {
			const url = icon.closest('li')!.querySelector('a')!.pathname + '#partial-timeline';
			icon.parentElement!.classList.remove('col-1'); // Also fix extra space added by GitHub #3174
			wrapAll([icon, icon.nextSibling!], <a className="Link--muted" href={url}/>);
		}
	});
}

void features.add(__filebasename, {
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
