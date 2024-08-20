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

const compareRegex = /compare\/([^.]+)(?:\.{2,3})(.+)?/;
export default function parseCompareUrl(pathname: string): Comparison | undefined {
	const base = getRepo(pathname)!;

	const [, baseBranch, heads] = compareRegex.exec(base.path) ?? [];
	if (!baseBranch) {
		return;
	}

	const headParts = heads.split(':');
	const headBranch = headParts.pop()!; // Branch is always last, or the only one
	const headOwner = headParts.shift() ?? base.owner; // The owner is first, or it's the same as the base
	const headName = headParts.pop() ?? base.name; // The repo is first or middle, or it's the same as the base

	if (headParts.length > 0) {
		throw new Error('Invalid compare URL format');
	}

	const headRepo: NameWithOwner = `${headOwner}/${headName}`;

	return {
		base: {
			nameWithOwner: base.nameWithOwner as NameWithOwner,
			branch: baseBranch,
		},
		head: {
			nameWithOwner: headRepo,
			branch: headBranch,
		},
		isCrossRepo: headRepo !== base.nameWithOwner,
	};
}

