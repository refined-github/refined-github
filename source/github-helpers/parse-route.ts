import {getCurrentBranch} from '.';

interface Pathname {
	user: string;
	repository: string;
	route: string;
	branch: string;
	filePath: string;
	toString: () => string;
}

function disambiguateReference(ambiguousReference: string[]): {branch: string, filePath: string} {
	const branch = ambiguousReference[0];
	const filePath = ambiguousReference.slice(1).join('/');

	const currentBranch = getCurrentBranch();
	const currentBranchSections = currentBranch.split('/');
	if (
		ambiguousReference.length === 1 || // Ref has no slashes
		currentBranchSections.length === 1 || // Current branch has no slashes
		/\^|~|@{/.test(branch) // Ref is an extended revision #3137 https://git-scm.com/docs/git-rev-parse#_specifying_revisions
	) {
		// Then the reference is not ambiguous
		return {branch, filePath};
	}

	for (const [i, section] of currentBranchSections.entries()) {
		if (ambiguousReference[i] !== section) {
			console.warn(`The supplied path (${ambiguousReference.join('/')}) is ambiguous (current reference is \`${currentBranch}\`)`);
			return {branch, filePath};
		}
	}

	return {
		branch: currentBranch,
		filePath: ambiguousReference.slice(currentBranchSections.length).join('/')
	}
}

export default function parseRoute(pathname: string): Pathname {
	const [user, repository, route, ...ambiguousReference] = pathname.replace(/^\/|\/$/g, '').split('/');
	const {branch, filePath} = disambiguateReference(ambiguousReference);

	return {
		user,
		repository,
		route,
		branch,
		filePath,
		toString() {
			return `/${this.user}/${this.repository}/${this.route}/${this.branch}/${this.filePath}`.replace(/\/$/, '');
		}
	};
}
