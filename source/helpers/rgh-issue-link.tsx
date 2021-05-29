import React from 'dom-chef';

export default function createRghIssueLink(issueNumber: number | number): Element {
	const issueLink = `https://github.com/sindresorhus/refined-github/issues/${issueNumber}`;
	return (
		<a target="_blank" rel="noopener noreferrer" data-hovercard-type="issue" data-hovercard-url={issueLink + '/hovercard'} href={issueLink}>
			#{issueNumber}
		</a>
	);
}
