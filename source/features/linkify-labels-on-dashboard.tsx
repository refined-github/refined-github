import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	// A `:not(.rgh)` selector is not needed since we already check for `not(a)` #3625
	const labelClass = [
		'.js-recent-activity-container :not(a) > .IssueLabel', // Recent activity
		'.js-all-activity-header + div :not(a) > .IssueLabel', // Newsfeed
	].join(',');
	observe(labelClass, {
		add(label) {
			const activity = label.closest('li, div:not([class])')!; // `div` is for the Newsfeed
			const isPR = select.exists('.octicon-git-pull-request', activity);
			const repository = select('a[data-hovercard-type="repository"]', activity)!;
			const url = new URL(`${repository.href}/${isPR ? 'pulls' : 'issues'}`);
			const labelName = label.textContent!.trim();
			url.searchParams.set('q', `is:${isPR ? 'pr' : 'issue'} is:open sort:updated-desc label:"${labelName}"`);
			wrap(label, <a href={String(url)}/>);
		},
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isDashboard,
	],
	init: onetime(init),
});
