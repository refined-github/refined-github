import {buildRepoURL} from './index.js';

// Build the commits page URL.
export default function buildCommitsPageUrl(commitSha?: string, commitsCount?: number): string {
	if (!commitsCount || commitsCount <= 1) {
		return buildRepoURL('commits');
	}

	const offset = Math.max(0, commitsCount - 2);
	const encodedSha = commitSha ? encodeURIComponent(commitSha) : '';
	return buildRepoURL('commits', `?after=${encodedSha}+${offset}`);
}
