import React from 'dom-chef';

export function createRghIssueLink(issueNumber: number | string): Element {
	const issueUrl = `https://github.com/refined-github/refined-github/issues/${issueNumber}`;
	return (
		<a
			target="_blank"
			rel="noopener noreferrer"
			data-hovercard-type="issue"
			data-hovercard-url={issueUrl + '/hovercard'}
			href={issueUrl}
		>
			#{issueNumber}
		</a>
	);
}

export function getFeatureUrl(id: FeatureID): string {
	return `https://github.com/refined-github/refined-github/blob/main/source/features/${id}.tsx`;
}
