export type PrInfo = {
	number: number;
	title: string;
	baseRefName: string;
	headRefName: string;
};

// A parent with more direct children than this is treated as an integration branch
// (e.g. `dev` in GitFlow with N feature PRs targeting it) and excluded from stack grouping.
export const defaultMaxDirectChildren = 3;

/**
 * Given PR info for all visible PRs in a list, returns a map of `child# → parent#`
 * representing detected stack relationships. A parent is detected when its `headRefName`
 * matches another visible PR's `baseRefName`.
 *
 * Parents with more than `maxDirectChildren` direct children are excluded from the
 * result — they are likely integration branches (e.g. `dev` in GitFlow) where features
 * fan out, not stack roots.
 */
export function detectStackParents(
	prs: PrInfo[],
	maxDirectChildren: number = defaultMaxDirectChildren,
): Map<number, number> {
	const byHead = new Map<string, PrInfo>();
	for (const pr of prs) {
		byHead.set(pr.headRefName, pr);
	}

	const parents = new Map<number, number>();
	for (const pr of prs) {
		const parent = byHead.get(pr.baseRefName);
		if (parent && parent.number !== pr.number) {
			parents.set(pr.number, parent.number);
		}
	}

	const childCount = new Map<number, number>();
	for (const parent of parents.values()) {
		childCount.set(parent, (childCount.get(parent) ?? 0) + 1);
	}

	const integrationParents = new Set<number>();
	for (const [parent, count] of childCount) {
		if (count > maxDirectChildren) {
			integrationParents.add(parent);
		}
	}

	if (integrationParents.size === 0) {
		return parents;
	}

	const toRemove: number[] = [];
	for (const [child, parent] of parents) {
		if (integrationParents.has(parent)) {
			toRemove.push(child);
		}
	}

	for (const child of toRemove) {
		parents.delete(child);
	}

	return parents;
}
