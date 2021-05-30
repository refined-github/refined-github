import React from 'dom-chef';

export function createRghIssueLink(issueNumber: number | string): Element {
	const issueUrl = getRghIssueUrl(issueNumber);
	return (
		<a target="_blank" rel="noopener noreferrer" data-hovercard-type="issue" data-hovercard-url={issueUrl + '/hovercard'} href={issueUrl}>
			#{issueNumber}
		</a>
	);
}

export function getRghIssueUrl(issueNumber: number | string): string {
	return `https://github.com/sindresorhus/refined-github/issues/${issueNumber}`;
}
