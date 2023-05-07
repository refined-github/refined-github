import getCurrentGitRef from './get-current-git-ref';

export default class GitHubURL {
	user = '';
	repository = '';
	route = '';
	branch = '';
	filePath = '';

	private internalUrl: URL;

	constructor(url: string) {
		// Use Facade pattern instead of inheritance #3193
		this.internalUrl = new URL(url);
		this.pathname = this.internalUrl.pathname;
	}

	toString(): string {
		return this.href;
	}

	assign(...replacements: Array<Partial<GitHubURL>>): this {
		Object.assign(this, ...replacements);
		return this;
	}

	private disambiguateReference(
		ambiguousReference: string[],
	): {branch: string; filePath: string} {
		const branch = ambiguousReference[0];
		// History pages might use search parameters
		const filePathFromSearch = this.searchParams.getAll('path[]').join('/');
		if (filePathFromSearch) {
			this.searchParams.delete('path[]');
			return {branch, filePath: filePathFromSearch};
		}

		const filePath = ambiguousReference.slice(1).join('/');

		const currentBranch = getCurrentGitRef();
		const currentBranchSections = currentBranch?.split('/');
		if (
			!currentBranch // Current branch could not be determined (1/2)
			|| !currentBranchSections // Current branch could not be determined (2/2)
			|| ambiguousReference.length === 1 // Ref has no slashes
			|| currentBranchSections.length === 1 // Current branch has no slashes
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
			filePath: ambiguousReference.slice(currentBranchSections.length).join('/'),
		};
	}

	get pathname(): string {
		return `/${this.user}/${this.repository}/${this.route}/${this.branch}/${this.filePath}`.replace(/((undefined)?\/)+$/g, '');
	}

	set pathname(pathname: string) {
		const [user, repository, route, ...ambiguousReference] = pathname.replace(/^\/|\/$/g, '').split('/');
		// Handle branch names containing multiple slashes #4492
		if (ambiguousReference.length === 2 && ambiguousReference[1].includes('%2F')) {
			const branch = ambiguousReference.join('/').replace(/%2F/g, '/');
			this.assign({user, repository, route, branch, filePath: ''});
			return;
		}

		const {branch, filePath} = this.disambiguateReference(ambiguousReference);
		this.assign({user, repository, route, branch, filePath});
	}

	get href(): string {
		// Update the actual underlying URL
		this.internalUrl.pathname = this.pathname;
		return this.internalUrl.href;
	}

	set href(href: string) {
		this.internalUrl.href = href;
	}

	// Proxy all other getters/setters to internalUrl

	get hash(): string {
		return this.internalUrl.hash;
	}

	set hash(hash: string) {
		this.internalUrl.hash = hash;
	}

	get search(): string {
		return this.internalUrl.search;
	}

	set search(search: string) {
		this.internalUrl.search = search;
	}

	get searchParams(): URLSearchParams {
		return this.internalUrl.searchParams;
	}
}
