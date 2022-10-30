import * as pageDetect from 'github-url-detection';

import * as api from './api';
import {getConversationNumber} from '.';

type PullRequestInfo = {
	// TODO: Use this for `restore-file` when GHE supports `compare`
	baseRefOid: string;
	// https://docs.github.com/en/graphql/reference/enums#mergeablestate
	mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
	viewerCanEditFiles: boolean;
};

export default async function getPrInfo(base: string, head: string, number = getConversationNumber()!): Promise<PullRequestInfo | undefined> {
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
		if (compare.status !== 'diverged') {
			return;
		}

		return repository.pullRequest;
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

	if (repository.pullRequest.headRef.compare.status !== 'DIVERGED') {
		return;
	}

	return repository.pullRequest;
}
