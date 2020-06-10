import {getCurrentBranch} from '.';

export default class GitHubURL {
	// @ts-expect-error https://github.com/microsoft/TypeScript/issues/26792
	user: string;
	// @ts-expect-error
	repository: string;
	// @ts-expect-error
	route: string;
	// @ts-expect-error
	branch: string;
	// @ts-expect-error
	filePath: string;

	readonly url: URL;

	constructor(url: string) {
		// Use Adapter pattern instead of inheritance #3193
		this.url = new URL(url);
		this.pathname = this.url.pathname;
	}

	assign(replacements: Partial<GitHubURL>) {
		Object.assign(this, replacements);

		// Update the actual underlying URL
		this.url.pathname = this.pathname;

		return this;
	}

	toString() {
		return this.url.href;
	}

	private disambiguateReference(ambiguousReference: string[]): {branch: string; filePath: string} {
		const branch = ambiguousReference[0];
		const filePathFromSearch = this.url.searchParams.getAll('path[]').join('/');
		if (filePathFromSearch) {
			this.url.searchParams.delete('path[]');
			return {branch, filePath: filePathFromSearch};
		}

		const filePath = ambiguousReference.slice(1).join('/');

		const currentBranch = getCurrentBranch();
		const currentBranchSections = currentBranch.split('/');
		if (
			ambiguousReference.length === 1 || // Ref has no slashes
			currentBranchSections.length === 1 // Current branch has no slashes
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

	get pathname() {
		return `/${this.user}/${this.repository}/${this.route}/${this.branch}/${this.filePath}`.replace(/\/+$/, '');
	}

	set pathname(pathname) {
		const [user, repository, route, ...ambiguousReference] = pathname.replace(/^\/|\/$/g, '').split('/');
		const {branch, filePath} = this.disambiguateReference(ambiguousReference);
		this.assign({user, repository, route, branch, filePath});

		// Update the actual underlying URL
		this.url.pathname = this.pathname;
	}
}
