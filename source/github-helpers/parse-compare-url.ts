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
	switch (headParts.length) {
		case 1: {
			// Path: compare/main...branch (same repo)
			return {baseBranch, head: base.nameWithOwner as NameWithOwner, headBranch: headParts[0]};
		}

		case 2: {
			// Path: compare/branch...user:branch (cross repo)
			return {baseBranch, head: `${headParts[0]}/${base.name}`, headBranch: headParts[1]};
		}

		case 3: {
			// Path: compare/main...user:repo:branch (cross repo, renamed repo)
			return {baseBranch, head: `${headParts[0]}/${headParts[1]}`, headBranch: headParts[2]};
		}

		default: {
			throw new Error('Invalid compare URL format');
		}
	}
}
