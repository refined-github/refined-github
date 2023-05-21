import api from './api.js';
import {getConversationNumber} from './index.js';

export type PullRequestInfo = {
	baseRefOid: string;
	headRefOid: string;
	// https://docs.github.com/en/graphql/reference/enums#mergeablestate
	mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
	viewerCanEditFiles: boolean;
	needsUpdate: boolean;
	behindBy: number;
};

export default async function getPrInfo(base: string, number = getConversationNumber()!): Promise<PullRequestInfo> {
	const {repository} = await api.v4uncached(`
		repository() {
			pullRequest(number: ${number}) {
				baseRefOid
				headRefOid
				mergeable
				viewerCanEditFiles
				headRef {
					compare(headRef: "${base}") {
						status
						aheadBy
					}
				}
			}
		}
	`);

	const {
		baseRefOid,
		headRefOid,
		mergeable,
		viewerCanEditFiles,
		headRef,
	} = repository.pullRequest;
	return {
		baseRefOid,
		headRefOid,
		mergeable,
		viewerCanEditFiles,
		// The comparison in the API is base -> head, so it must be flipped
		behindBy: headRef.compare.aheadBy,
		needsUpdate: headRef.compare.status === 'DIVERGED',
	};
}
