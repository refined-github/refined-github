import * as api from './api';
import {getConversationNumber} from '.';

interface PullRequestInfo {
	// TODO: Probably can be used for #3863
	// Note: May fall out of date after a force-push
	baseRefOid: string;

	// https://docs.github.com/en/graphql/reference/enums#mergeablestate
	mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
	viewerCanEditFiles: boolean;
}

export default async function getPrInfo(number = getConversationNumber()!): Promise<PullRequestInfo> {
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
