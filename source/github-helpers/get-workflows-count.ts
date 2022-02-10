import cache from 'webext-storage-cache';

import * as api from './api';
import {getRepo} from '.';

export default cache.function(async (): Promise<number> => {
	const {repository: {workflowFiles}} = await api.v4(`
		repository() {
			workflowFiles: object(expression: "HEAD:.github/workflows") {
				... on Tree { entries { oid } }
			}
		}
	`);

	return workflowFiles?.entries.length ?? 0;
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: () => 'workflows-count:' + getRepo()!.nameWithOwner,
});
