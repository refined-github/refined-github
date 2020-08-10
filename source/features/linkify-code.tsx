import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';
import {observe} from 'selector-observer';

import features from '.';
import {linkifiedURLClass, linkifyURLs, linkifyIssues} from '../github-helpers/dom-formatters';

function init(): void {
	const selectors = [
		'.js-blob-wrapper',
		'.blob-wrapper',
		'.comment-body',
		'.blob-expanded'
	].map(selector => selector + `:not(.${linkifiedURLClass})`).join();

	observe(selectors, {
		add(wrappers) {
			// Linkify full URLs
			// `.blob-code-inner` in diffs
			// `pre` in GitHub comments
			for (const element of select.all('.blob-code-inner, pre', wrappers)) {
				linkifyURLs(element);
			}

			// Linkify issue refs in comments
			for (const element of select.all('span.pl-c', wrappers)) {
				linkifyIssues(element);
			}

			// Mark code block as touched
			wrappers.classList.add(linkifiedURLClass);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Linkifies URLs and issue references in code.',
	screenshot: 'https://cloud.githubusercontent.com/assets/170270/25370217/61718820-29b3-11e7-89c5-2959eaf8cac8.png'
}, {
	include: [
		pageDetect.hasCode
	],
	init: onetime(init)
});
