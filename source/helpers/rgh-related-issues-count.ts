import api from '../github-helpers/api.js';
import {getFeatureRelatedIssuesQuery, getFeatureRelatedIssuesUrl} from './rgh-links.js';

const relatedIssuesCountByFeature = new Map<FeatureId, Promise<number>>();

export default async function getOpenRelatedIssuesCount(featureId: string): Promise<number> {
	let countPromise = relatedIssuesCountByFeature.get(featureId as FeatureId);
	if (!countPromise) {
		const query = `${getFeatureRelatedIssuesQuery(featureId as FeatureId)} repo:refined-github/refined-github`;
		countPromise = (async () => {
			const response = await api.v3(`/search/issues?q=${encodeURIComponent(query)}`);
			return Number(response.total_count);
		})();
		relatedIssuesCountByFeature.set(featureId as FeatureId, countPromise);
	}

	return countPromise;
}

export function getFeatureRelatedIssuesUrlForAnyName(featureId: string): URL {
	return getFeatureRelatedIssuesUrl(featureId as FeatureId);
}
