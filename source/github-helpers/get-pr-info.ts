import api from './api.js';
import {getConversationNumber} from './index.js';

export type PullRequestInfo = {
	baseRefOid: string;
	headRefOid: string;
	// https://docs.github.com/en/graphql/reference/enums#mergeablestate
	mergeable: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';

	viewerCanUpdate: boolean;

	// It's not clear why this is `false` on a PR I received (I *can* edit the files), but I'm leaving it as a fallback
	viewerCanEditFiles: boolean;
	needsUpdate: boolean;
	behindBy: number;
	// https://docs.github.com/en/graphql/reference/enums#defaultrepositorypermissionfield
	headRepoPerm: 'ADMIN' | 'WRITE' | 'READ' | 'NONE';
};

export default async function getPrInfo(base: string, number = getConversationNumber()!): Promise<PullRequestInfo> {
	const {repository} = await api.v4uncached(`
		repository() {
			pullRequest(number: ${number}) {
				baseRefOid
				headRefOid
				mergeable
				viewerCanUpdate
				viewerCanEditFiles
				headRef {
					compare(headRef: "${base}") {
						status
						aheadBy
					}
				}
				headRepository {
					viewerPermission
				}
			}
		}
	`);

	const {
		baseRefOid,
		headRefOid,
		mergeable,
		viewerCanUpdate,
		viewerCanEditFiles,
		headRef,
		headRepository,
	} = repository.pullRequest;
	return {
		baseRefOid,
		headRefOid,
		viewerCanUpdate,
		mergeable,
		viewerCanEditFiles,
		// The comparison in the API is base -> head, so it must be flipped
		behindBy: headRef.compare.aheadBy,
		needsUpdate: headRef.compare.status === 'DIVERGED',
		headRepoPerm: headRepository.viewerPermission,
	};
}
