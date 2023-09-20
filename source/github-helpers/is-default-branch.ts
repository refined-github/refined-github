import getDefaultBranch from './get-default-branch.js';
import {getRepo} from './index.js';

/** Detects if the current view is on the default branch. To be used on file/folder/commit lists */
export default async function isDefaultBranch(): Promise<boolean> {
	const repo = getRepo();
	if (!repo) {
		return false;
	}

	const [type, ...parts] = repo.path.split('/');
	if (type !== 'tree' && type !== 'blob') {
		return false;
	}

	// Don't use `getCurrentGitRef` because it requires too much DOM. This is good enough, it only fails when:
	// defaultBranch === 'a/b' && currentBranch === 'a'
	const path = parts.join('/');
	const defaultBranch = await getDefaultBranch();
	return path === defaultBranch || defaultBranch.startsWith(`${path}/`);
}
