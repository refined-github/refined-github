import {isRepoRoot} from 'github-url-detection';

import getCurrentGitRef from './get-current-git-ref.js';

export default class GitHubFileURL extends URL {
	user = '';
	repository = '';
	route = '';
	branch = '';
	filePath = '';

	assign = Object.assign.bind(null, this);

	constructor(url: string) {
		super(url);
		this.pathname = super.pathname;
	}

	override toString(): string {
		return this.href;
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

	override get pathname(): string {
		return `/${this.user}/${this.repository}/${this.route}/${this.branch}/${this.filePath}`.replaceAll(/((undefined)?\/)+$/g, '');
	}

	override set pathname(pathname: string) {
		const [user, repository, route, ...ambiguousReference] = pathname.replaceAll(/^\/|\/$/g, '').split('/');
		// Use `location` in order to avoid global state usage
		// https://github.com/refined-github/refined-github/issues/6637
		if (isRepoRoot(location) || (ambiguousReference.length === 2 && ambiguousReference[1].includes('%2F'))) {
			const branch = ambiguousReference.join('/').replaceAll('%2F', '/');
			this.assign({user, repository, route, branch, filePath: ''});
			return;
		}

		const {branch, filePath} = this.disambiguateReference(ambiguousReference);
		this.assign({user, repository, route, branch, filePath});
	}

	override get href(): string {
		// Update the actual underlying URL
		super.pathname = this.pathname;
		return super.href;
	}
}
