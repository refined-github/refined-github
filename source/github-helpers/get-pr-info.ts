import * as api from './api';
import {getConversationNumber} from '.';

export type PullRequestInfo = {
	baseRefOid: string;
	// https://docs.github.com/en/graphql/reference/enums#mergeablestate
	mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
	viewerCanEditFiles: boolean;
	needsUpdate: boolean;
	behindBy: number;
};

export default async function getPrInfo(base: string, number = getConversationNumber()!): Promise<PullRequestInfo> {
	const {repository} = await api.v4(`
		repository() {
			pullRequest(number: ${number}) {
				baseRefOid
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
		mergeable,
		viewerCanEditFiles,
		headRef,
	} = repository.pullRequest;
	return {
		baseRefOid,
		mergeable,
		viewerCanEditFiles,
		// The comparison in the API is base -> head, so it must be flipped
		behindBy: headRef.compare.aheadBy,
		needsUpdate: headRef.compare.status === 'DIVERGED',
	};
}
