import React from 'dom-chef';

export function createRghIssueLink(issueNumber: number | string): Element {
	const issueUrl = getRghIssueUrl(issueNumber);
	return (
		<a target="_blank" rel="noopener noreferrer" data-hovercard-type="issue" data-hovercard-url={issueUrl + '/hovercard'} href={issueUrl}>
			#{issueNumber}
		</a>
	);
}

/** @deprecated Only use this function for dynamic URLs. For static URLs, paste the full URL string instead */
export function getRghIssueUrl(issueNumber: number | string): string {
	return `https://github.com/refined-github/refined-github/issues/${issueNumber}`;
}
