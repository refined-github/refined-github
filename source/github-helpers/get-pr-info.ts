import * as pageDetect from 'github-url-detection';

import * as api from './api';
import {getConversationNumber} from '.';

type PullRequestInfo = {
	prInfo: {
		// TODO: Use this for `restore-file` when GHE supports `compare`
		baseRefOid: string;
		// https://docs.github.com/en/graphql/reference/enums#mergeablestate
		mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
		viewerCanEditFiles: boolean;
	};
	comparison: {
		status: 'BEHIND' | 'DIVERGED' | 'AHEAD' | 'IDENTICAL';
	};
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

		return {
			prInfo: repository.pullRequest,
			comparison: compare,
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
						aheadBy
					}
				}
			}
		}
	`);

	return {
		prInfo: repository.pullRequest,
		comparison: repository.pullRequest.headRef.compare,
	};
}
