import * as api from './api.js';
import {getConversationNumber} from './index.js';

export type PullRequestInfo = {
	baseRefOid: string;
	// https://docs.github.com/en/graphql/reference/enums#mergeablestate
	mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
	viewerCanEditFiles: boolean;
	needsUpdate: boolean;
	behindBy: number;
};

export default async function getPrInfo(base: string, conversationNumber = getConversationNumber()!): Promise<PullRequestInfo> {
	const {repository} = await api.v4(`
		query getPrInfo($owner: String!, $name: String!, $conversationNumber: Int!, $base: String!) {
			repository(owner: $owner, name: $name) {
				pullRequest(number: $conversationNumber) {
					baseRefOid
					mergeable
					viewerCanEditFiles
					headRef {
						compare(headRef: $base) {
							status
							aheadBy
						}
					}
				}
			}
		}
	`, {
		variables: {
			conversationNumber,
			base,
		},
	});

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
