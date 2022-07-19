import * as api from './api';
import {getConversationNumber} from '.';

interface PullRequestInfo {
	// TODO: Probably can be used for #3863 and #4679
	baseRefOid: string;

	// https://docs.github.com/en/graphql/reference/enums#mergeablestate
	mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
	viewerCanEditFiles: boolean;
}

export default async function getPrInfo(number = getConversationNumber()!): Promise<PullRequestInfo> {
	const {pullRequest} = await api.v4repository(`
		pullRequest(number: ${number}) {
			baseRefOid
			mergeable
			viewerCanEditFiles
		}
	`);
	return pullRequest;
}
