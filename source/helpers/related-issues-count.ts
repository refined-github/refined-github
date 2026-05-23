import api from '../github-helpers/api.js';
import {getFeatureRelatedIssuesQuery} from './rgh-links.js';

async function getOpenRelatedIssuesCount(featureId: string): Promise<number> {
	const query = `${getFeatureRelatedIssuesQuery(featureId)} repo:refined-github/refined-github`;
	const response = await api.v3(`/search/issues?q=${encodeURIComponent(query)}`);
	return response.total_count;
}

export default getOpenRelatedIssuesCount;
