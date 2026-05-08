import React from 'dom-chef';

import {getOldFeatureNames} from '../feature-data.js';

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

export function getFeatureUrl(id: FeatureId): string {
	return `https://github.com/refined-github/refined-github/blob/main/source/features/${id}.tsx`;
}

export function getFeatureRelatedIssuesQuery(id: string): string {
	const oldNames = getOldFeatureNames(id);
	const searchTerms = [id, ...oldNames].map(name => `"${name}"`).join(' OR ');
	return `is:open (${searchTerms})`;
}

export function getFeatureRelatedIssuesUrl(id: string): URL {
	const conversationsUrl = new URL('https://github.com/refined-github/refined-github/issues');
	conversationsUrl.searchParams.set('q', getFeatureRelatedIssuesQuery(id));
	return conversationsUrl;
}
