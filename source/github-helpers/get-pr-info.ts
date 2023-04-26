import * as api from './api';
import {getConversationNumber} from '.';

export type PullRequestInfo = {
	// TODO: Use this for `restore-file`
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

	const {pullRequest} = repository;
	return {
		...repository.pullRequest,
		// The comparison in the API is base -> head, so it must be flipped
		behindBy: pullRequest.headRef.compare.aheadBy,
		needsUpdate: pullRequest.headRef.compare.status === 'DIVERGED',
	};
}
