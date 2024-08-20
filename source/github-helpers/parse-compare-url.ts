import {RepositoryInfo} from 'github-url-detection';

import {getRepo, NameWithOwner} from './index.js';

type Comparison = {
	head: {
		nameWithOwner: NameWithOwner;
		branch: string;
	};
	base: {
		nameWithOwner: NameWithOwner;
		branch: string;
	};
	isCrossRepo: boolean;
};

export default function parseCompareUrl(pathname: string): Comparison | undefined {
	const baseRepo = getRepo(pathname)!;

	const comparison = parseComparisonPath(baseRepo);
	if (!comparison) {
		return;
	}

	const {
		baseBranch,
		head: headRepo,
		headBranch,
	} = comparison;

	return {
		base: {
			nameWithOwner: baseRepo.nameWithOwner as NameWithOwner,
			branch: baseBranch,
		},
		head: {
			nameWithOwner: headRepo,
			branch: headBranch,
		},
		isCrossRepo: headRepo !== baseRepo.nameWithOwner,
	};
}

const compareRegex = /compare\/([^.]+)(?:\.{2,3})(.+)?/;

function parseComparisonPath(base: RepositoryInfo): undefined | {
	baseBranch: string;
	head: NameWithOwner;
	headBranch: string;
} {
	const match = compareRegex.exec(base.path);
	if (!match) {
		return;
	}

	const [, baseBranch, heads] = match;

	const headParts = heads.split(':');
	const headBranch = headParts.pop()!; // Branch is always last, or the only one
	const headOwner = headParts.shift() ?? base.owner; // The owner is first, or it's the same as the base
	const headRepo = headParts.pop() ?? base.name; // The repo is first or middle, or it's the same as the base

	if (headParts.length > 0) {
		throw new Error('Invalid compare URL format');
	}

	return {baseBranch, head: `${headOwner}/${headRepo}`, headBranch};
}
