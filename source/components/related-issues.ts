import pMemoize from 'p-memoize';

import api from '../github-helpers/api.js';
import {getExtensionReleaseDate} from '../helpers/extension-release-age.js';
import {getFeatureRelatedIssuesQuery, getFeatureSearchTerms} from '../helpers/rgh-links.js';
import GetRelatedIssues from './related-issues.gql';

export type RelatedIssue = {
	__typename: 'Issue' | 'PullRequest';
	number: number;
	title: string;
	url: string;
	state: 'OPEN' | 'CLOSED' | 'MERGED';
	stateReason?: 'COMPLETED' | 'NOT_PLANNED' | 'REOPENED' | 'DUPLICATE';
	isDraft?: boolean;
};

type RelatedIssues = {
	/** Number of open issues and PRs that mention the feature */
	openCount: number;
	/** Open issues and PRs, plus the closed ones created since the user's version was released */
	list: RelatedIssue[];
};

const repo = 'repo:refined-github/refined-github';

function toSearchDate(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}

// Memoized so that every component asking about the same feature shares one request
const getRelatedIssues = pMemoize(async (featureId: string): Promise<RelatedIssues> => {
	const since = toSearchDate(getExtensionReleaseDate());
	const variables = {
		// GitHub's search requires `is:issue` or `is:pr` and returns nothing otherwise
		openQuery: `${repo} (is:issue OR is:pr) ${getFeatureRelatedIssuesQuery(featureId)}`,
		listQuery: `${repo} (is:issue OR is:pr) ${
			getFeatureSearchTerms(featureId)
		} (state:open OR created:>=${since}) sort:created-desc`,
	};

	const {open, related} = await api.v4(GetRelatedIssues, {variables});
	return {
		openCount: open.issueCount,
		list: related.nodes,
	};
});

export default getRelatedIssues;
