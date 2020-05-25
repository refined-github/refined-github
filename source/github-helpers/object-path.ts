import {getCurrentBranch} from '.';

function disambiguateReference(ambiguousReference: string[]): {branch: string; filePath: string} {
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
	};
}

export default class ObjectPath {
	user: string;
	repository: string;
	route: string;
	branch: string;
	filePath: string;
	constructor(pathname: string, replacements: Partial<ObjectPath> = {}) {
		const [user, repository, route, ...ambiguousReference] = pathname.replace(/^\/|\/$/g, '').split('/');
		const {branch, filePath} = disambiguateReference(ambiguousReference);

		// Move these to Object.assign(this, {...}, replacements) after https://github.com/microsoft/TypeScript/issues/26792
		this.user = user;
		this.repository = repository;
		this.route = route;
		this.branch = branch;
		this.filePath = filePath;
		Object.assign(this, replacements);
	}

	assign(replacements: Partial<ObjectPath>): this {
		Object.assign(this, replacements);
		return this;
	}

	toString() {
		return `/${this.user}/${this.repository}/${this.route}/${this.branch}/${this.filePath}`.replace(/\/$/, '');
	}
}
