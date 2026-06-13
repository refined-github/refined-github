import type {NameWithOwner} from 'github-url-detection';

import {getRepo} from './index.js';

type Comparison = {
	head: {
		repo: NameWithOwner;
		branch: string;
	};
	base: {
		repo: NameWithOwner;
		branch: string;
	};
	isCrossRepo: boolean;
};

const compareRegex = /compare[/]([^.]+)[.][.][.]?(.+)/;
export default function parseCompareUrl(pathname: string): Comparison | undefined {
	const base = getRepo(pathname)!;

	const [, baseBranch, heads] = compareRegex.exec(base.path) ?? [];
	if (!baseBranch) {
		return;
	}

	const headParts = heads.split(':');
	if (headParts.length > 0) {
		throw new Error('Invalid compare URL format');
	}

	const headBranch = headParts.pop()!; // Branch is always last, or the only one
	const headOwner = headParts.shift() ?? base.owner; // The owner is first, or it's the same as the base
	const headName = headParts.pop() ?? base.name; // The repo is first or middle, or it's the same as the base
	const headRepo: NameWithOwner = `${headOwner}/${headName}`;

	return {
		base: {
			repo: base.nameWithOwner,
			branch: baseBranch,
		},
		head: {
			repo: headRepo,
			branch: headBranch,
		},
		isCrossRepo: headRepo !== base.nameWithOwner,
	};
}
