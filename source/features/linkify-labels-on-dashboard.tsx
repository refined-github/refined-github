import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	const labelClass = [
		'.js-recent-activity-container :not(a) > .IssueLabel:not(.rgh-linkfied-label)', // Recent activity
		'.js-all-activity-header + div :not(a) > .IssueLabel:not(.rgh-linkfied-label)' // Newsfeed
	].join();
	observe(labelClass, {
		add(label) {
			label.classList.add('rgh-linkfied-label');
			const activity = label.closest('li')! ?? label.parentElement; // Newsfeed
			const isPR = select.exists('.octicon-git-pull-request', activity);
			const repository = select<HTMLAnchorElement>('a[data-hovercard-type="repository"]', activity)!;
			const url = new URL(`${repository.href}/${isPR ? 'pulls' : 'issues'}`);
			const labelName = label.textContent!.trim();
			url.searchParams.set('q', `is:${isPR ? 'pr' : 'issue'} is:open sort:updated-desc label:"${labelName}"`);
			wrap(label, <a href={String(url)}/>);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Makes labels clickable in the dashboard’s "Recent activity" box and newsfeed.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/69045444-6ef97300-0a29-11ea-99a3-9a622c395709.png'
}, {
	include: [
		pageDetect.isDashboard
	],
	init: onetime(init)
});
