import * as pageDetect from 'github-url-detection';

import api from '../github-helpers/api.js';
import {getFeatureRelatedIssuesQuery} from './rgh-links.js';

async function getOpenRelatedIssuesCount(featureId: string): Promise<number> {
	const query = `${getFeatureRelatedIssuesQuery(featureId)} repo:refined-github/refined-github`;
	const response = await api.v3(`/search/issues?q=${encodeURIComponent(query)}`);
	// Don't count the current issue if we're on it
	const adjustment = pageDetect.isOpenConversation() ? -1 : 0;
	return response.total_count as number + adjustment;
}

export default getOpenRelatedIssuesCount;
