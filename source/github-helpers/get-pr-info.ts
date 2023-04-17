import * as pageDetect from 'github-url-detection';

import * as api from './api';
import {getConversationNumber} from '.';

export type PullRequestInfo = {
	// TODO: Use this for `restore-file` when GHE supports `compare`
	baseRefOid: string;
	// https://docs.github.com/en/graphql/reference/enums#mergeablestate
	mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
	viewerCanEditFiles: boolean;
	needsUpdate: boolean;
	behindBy: number;
};

export default async function getPrInfo(base: string, head: string, number = getConversationNumber()!): Promise<PullRequestInfo> {
	if (pageDetect.isEnterprise()) {
		const {repository} = await api.v4(`
			repository() {
				pullRequest(number: ${number}) {
					mergeable
					viewerCanEditFiles
				}
			}
		`);

		const compare = await api.v3(`compare/${base}...${head}?page=10000`); // `page=10000` avoids fetching any commit information, which is heavy

		repository.pullRequest.headRef.compare.behindBy = compare.behind_by;
		const {pullRequest} = repository;
		return {
			...repository.pullRequest,
			behindBy: compare.behind_by,
			needsUpdate: compare.status === 'diverged' && pullRequest.viewerCanEditFiles && pullRequest.mergeable !== 'CONFLICTING',
		};
	}

	const {repository} = await api.v4(`
		repository() {
			pullRequest(number: ${number}) {
				baseRefOid
				mergeable
				viewerCanEditFiles
				headRef {
					compare(headRef: "${base}") {
						status
						behindBy
					}
				}
			}
		}
	`);

	const {pullRequest} = repository;
	return {
		...repository.pullRequest,
		behindBy: pullRequest.headRef.compare.behindBy,
		needsUpdate: pullRequest.headRef.compare.status === 'DIVERGED' && pullRequest.viewerCanEditFiles && pullRequest.mergeable !== 'CONFLICTING',
	};
}
