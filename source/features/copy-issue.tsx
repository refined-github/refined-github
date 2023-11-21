import React from 'dom-chef';
import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';

function getPathDetails(pathname = location.pathname): {ownerName: string; repoName: string; issueNumber: string} {
	const [, ownerName, repoName, , issueNumber] = pathname.split('/');
	return {ownerName, repoName, issueNumber};
}

type GitHubIssue = {
	title: string;
	body: string;
	labels: Array<{name: string}>;
	assignees: Array<{login: string}>;
	milestone: {number: number} | undefined;
};

function addDropdownLink(menu: HTMLElement): void {
	$('.show-more-popover', menu.parentElement!)!.append(
		<div className="dropdown-divider"/>,
		<a
			href="#"
			className="dropdown-item btn-link rgh-copy-issue"
			role="menuitem"
			title="Create a new issue from this one"
			target="_blank"
			rel="noreferrer" onClick={async event => {
				event.preventDefault();
				const {ownerName, repoName, issueNumber} = getPathDetails();
				const issue = await api.v3(`issues/${issueNumber}`) as unknown as GitHubIssue;

				// Set the href to the creation url of the current issue
				// See: https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue#creating-an-issue-from-a-url-query
				const parameters = new URLSearchParams({
					title: `Copy of: ${issue.title}`,
					body: issue.body,
					labels: issue.labels.map(label => label.name).join(','),
					assignees: issue.assignees.map(assignee => assignee.login).join(','),
					milestone: issue.milestone?.number.toString() ?? '',
				});
				const creationUrl = new URL(`https://${location.hostname}/${ownerName}/${repoName}/issues/new?${parameters.toString()}`);

				window.open(creationUrl, '_blank');
			}}
		>
			Copy this issue
		</a>,
	);
}

function init(signal: AbortSignal): void {
	observe('.timeline-comment-actions > details:last-child', menu => {
		addDropdownLink(menu);
	}, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isIssue,
	],
	init,
});

/*

Test URLs:

https://github.com/internetarchive/openlibrary/issues/8544
https://github.com/metabase/metabase/issues/35858

*/
