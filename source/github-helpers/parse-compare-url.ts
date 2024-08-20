import {RepositoryInfo} from 'github-url-detection';

import {getRepo} from './index.js';
import {defaultBranchOfRepo} from './get-default-branch.js';

type Comparison = {
	head: {
		repo: RepositoryInfo;
		branch: string;
	};
	base: {
		repo: RepositoryInfo;
		branch: string;
	};
	isCrossRepo: boolean;
};

export default async function parseCompareUrl(): Promise<Comparison> {
	const baseRepo = getRepo()!;

	const {
		baseBranch,
		headRepo,
		headBranch,
	} = await parseComparisonPath(baseRepo);

	console.log({
		base: {
			repo: baseRepo,
			branch: baseBranch,
		},
		head: {
			repo: headRepo,
			branch: headBranch,
		},
		isCrossRepo: headRepo.nameWithOwner !== baseRepo.nameWithOwner,
	});

	return {
		base: {
			repo: baseRepo,
			branch: baseBranch,
		},
		head: {
			repo: headRepo,
			branch: headBranch,
		},
		isCrossRepo: headRepo.nameWithOwner !== baseRepo.nameWithOwner,
	};
}

async function parseComparisonPath(baseRepo: RepositoryInfo): Promise<{
	baseBranch: string;
	headRepo: RepositoryInfo;
	headBranch: string;
}> {
	const headRepo = {...baseRepo};
	// Path: compare
	let baseBranch = await defaultBranchOfRepo.get(baseRepo);
	let headBranch = baseBranch;

	const pathname = baseRepo.path;

	const compareRegex = /compare\/?([^.]+)?(\.{2,3})?(.+)?/;
	const match = compareRegex.exec(pathname);

	if (!match) {
		throw new Error('Invalid compare URL format');
	}

	let heads: string | undefined;
	[, baseBranch, , heads] = match;

	// Path: compare/main or compare/test/bun, heads is undefined
	if (!heads) {
		return {baseBranch, headRepo, headBranch: baseBranch};
	}

	const headParts = heads.split(':');
	switch (headParts.length) {
		case 1: {
			// Path: compare/main...test/bun
			headBranch = headParts[0];
			break;
		}

		case 2: {
			// Path: compare/sandbox/keep-branch...yakov116:upstream
			[headRepo.owner, headBranch] = headParts;
			headRepo.nameWithOwner = `${headRepo.owner}/${headRepo.name}`;
			break;
		}

		case 3: {
			// Path: compare/main...refined-github:refined-github:rollup
			[headRepo.owner, headRepo.name, headBranch] = headParts;
			headRepo.nameWithOwner = `${headRepo.owner}/${headRepo.name}`;
			break;
		}

		default: {
			throw new Error('Invalid compare URL format');
		}
	}

	return {baseBranch, headRepo, headBranch};
}

