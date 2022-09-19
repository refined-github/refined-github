import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '../feature-manager';

function linkifyLabel(label: Element): void {
	const activity = label.closest('div:not([class])')!;
	const isPR = select.exists('.octicon-git-pull-request', activity);
	const repository = select('a[data-hovercard-type="repository"]', activity)!;
	const url = new URL(`${repository.href}/${isPR ? 'pulls' : 'issues'}`);
	const labelName = label.textContent!.trim();

	url.searchParams.set('q', `is:${isPR ? 'pr' : 'issue'} is:open sort:updated-desc label:"${labelName}"`);
	wrap(label, <a href={url.href}/>);
}

function init(): Deinit {
	// A `:not(.rgh)` selector is not needed since we already check for `not(a)` #3625
	return observe('.news :not(a) > .IssueLabel', {
		add: linkifyLabel,
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isDashboard,
	],
	deduplicate: 'has-rgh',
	init,
});
