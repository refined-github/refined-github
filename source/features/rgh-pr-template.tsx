import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {replaceFieldText} from 'text-field-edit';

import features from '../feature-manager.js';
import {isRefinedGitHubRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

function extract(textarea: HTMLTextAreaElement): void {
	replaceFieldText(textarea, /<!--(.+)-->\n/s, (_, match) => {
		textarea.closest('tab-container')!.before(
			<div style={{whiteSpace: 'pre-wrap'}} className="flash mb-3 p-3">
				{match.trim()}
			</div>,
		);

		return '';
	});
}

function init(signal: AbortSignal): void {
	observe('#pull_request_body', extract, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [isRefinedGitHubRepo, pageDetect.isCompare],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/compare/main...sandbox/keep-branch?quick_pull=1

*/
