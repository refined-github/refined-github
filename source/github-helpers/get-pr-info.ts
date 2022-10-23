import * as api from './api';
import {getConversationNumber} from '.';

type PullRequestInfo = {
	// TODO: Probably can be used for #3863 and #4679
	baseRefOid: string;

	// https://docs.github.com/en/graphql/reference/enums#mergeablestate
	mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
	viewerCanEditFiles: boolean;
	headRef: {
		compare: {
			status: 'BEHIND' | 'DIVERGED' | 'AHEAD' | 'IDENTICAL';
		};
	};
};

export default async function getPrInfo(head: string, number = getConversationNumber()!): Promise<PullRequestInfo> {
	const {repository} = await api.v4(`
		repository() {
			pullRequest(number: ${number}) {
				baseRefOid
				mergeable
				viewerCanEditFiles
				headRef {
					compare(headRef: "${head}") {
						status
						behindBy
						aheadBy
					}
				}
			}
		}
	`);
	return repository.pullRequest;
}
