import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {linkifiedURLClass, linkifyURLs, linkifyIssues} from '../github-helpers/dom-formatters';

function init(): void {
	const selectors = [
		'.js-blob-wrapper',
		'.blob-wrapper',
		'.comment-body.d-block',
		'.blob-expanded'
	].map(selector => selector + `:not(.${linkifiedURLClass})`).join();

	observe(selectors, {
		add(wrappers) {
			// Linkify full URLs
			// `.blob-code-inner` in diffs
			// `pre` in GitHub comments
			for (const element of $$('.blob-code-inner, pre', wrappers)) {
				linkifyURLs(element);
			}

			// Linkify issue refs in comments
			for (const element of $$('span.pl-c', wrappers)) {
				linkifyIssues(element);
			}

			// Mark code block as touched
			wrappers.classList.add(linkifiedURLClass);
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasCode
	],
	init: onetime(init)
});
