import {isRepoRoot} from 'github-url-detection';

import getCurrentGitRef from './get-current-git-ref.js';

export default class GitHubFileURL {
	user = '';
	repository = '';
	route = '';
	branch = '';
	filePath = '';

	private readonly internalUrl: URL;

	constructor(url: string) {
		// Use Facade pattern instead of inheritance #3193
		this.internalUrl = new URL(url);
		this.pathname = this.internalUrl.pathname;
	}

	toString(): string {
		return this.href;
	}

	assign(...replacements: Array<Partial<GitHubFileURL>>): this {
		Object.assign(this, ...replacements);
		return this;
	}

	// Handle branch names containing multiple slashes #4492
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

		// TODO: `getCurrentGitRef` uses global state https://github.com/refined-github/refined-github/issues/6637
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

		for (const [index, section] of currentBranchSections.entries()) {
			if (ambiguousReference[index] !== section) {
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
		return `/${this.user}/${this.repository}/${this.route}/${this.branch}/${this.filePath}`.replaceAll(/(?:(?:undefined)?\/)+$/g, '');
	}

	set pathname(pathname: string) {
		const [user, repository, route, ...ambiguousReference] = pathname
			.replaceAll(/^\/|\/$/g, '')
			.replaceAll('%2F', '/') // Escaped in some cases
			.split('/');

		// If GitHubFileURL is being used on the current URL, then allow its "same page" optimizations to work (i.e. parse document.title)
		if (pathname === location.pathname ? isRepoRoot() : isRepoRoot(new URL(pathname, this.internalUrl))) {
			this.assign({
				user,
				repository,
				route,
				branch: ambiguousReference.join('/'),
				filePath: '',
			});
			return;
		}

		const {branch, filePath} = this.disambiguateReference(ambiguousReference);
		this.assign({
			user,
			repository,
			route,
			branch,
			filePath,
		});
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
