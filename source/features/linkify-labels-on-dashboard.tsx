import React from 'dom-chef';
import {$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function linkifyLabel(label: Element): void {
	const activity = label.closest('div:not([class])')!;
	const isPR = elementExists('.octicon-git-pull-request', activity);
	const repository = $('a[data-hovercard-type="repository"]', activity)!;
	const url = new URL(`${repository.href}/${isPR ? 'pulls' : 'issues'}`);
	const labelName = label.textContent.trim();

	url.searchParams.set('q', `is:${isPR ? 'pr' : 'issue'} is:open sort:updated-desc label:"${labelName}"`);
	wrap(label, <a href={url.href}/>);
}

function init(signal: AbortSignal): void {
	observe('.news :not(a) > .IssueLabel', linkifyLabel, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isDashboard,
	],
	init,
});
