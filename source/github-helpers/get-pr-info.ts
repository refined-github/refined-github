import * as api from './api';
import {getConversationNumber} from '.';

type PullRequestInfo = {
	// TODO: Probably can be used for #3863 and #4679
	baseRefOid: string;

	// https://docs.github.com/en/graphql/reference/enums#mergeablestate
	mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
	viewerCanEditFiles: boolean;
};

type PullRequestAheadStatus = {
	status: 'BEHIND' | 'DIVERGED' | 'AHEAD' | 'IDENTICAL';
};

export async function getPrInfo(number = getConversationNumber()!): Promise<PullRequestInfo> {
	const {repository} = await api.v4(`
		repository() {
			pullRequest(number: ${number}) {
				baseRefOid
				mergeable
				viewerCanEditFiles
			}
		}
	`);
	return repository.pullRequest;
}

// TODO: Merge the 2 functions after it's supported by GHE
export async function getPrBranchAheadStatus(base: string, number = getConversationNumber()!): Promise<PullRequestAheadStatus> {
	const {repository} = await api.v4(`
		repository() {
			pullRequest(number: ${number}) {
				headRef {
					compare(headRef: "${base}") {
						status
						behindBy
						aheadBy
					}
				}
			}
		}
	`);
	return repository.pullRequest.headRef.compare;
}
