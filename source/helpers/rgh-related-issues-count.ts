import mem from 'memoize';

import api from '../github-helpers/api.js';
import {getFeatureRelatedIssuesQuery} from './rgh-links.js';

const getOpenRelatedIssuesCount = mem(async (featureId: string): Promise<number> => {
	const query = `${getFeatureRelatedIssuesQuery(featureId)} repo:refined-github/refined-github`;
	const response = await api.v3(`/search/issues?q=${encodeURIComponent(query)}`);
	return Number(response.total_count);
});

export default getOpenRelatedIssuesCount;
