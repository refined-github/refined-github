import { RepositoryInfo } from "github-url-detection";
import { getRepo } from "./index.js";
import { defaultBranchOfRepo } from "./get-default-branch.js";


interface Comparison {
	head: RepositoryInfo & {
		branch: string;
	};
	base: RepositoryInfo & {
		branch: string;
	};
	isCrossRepo: boolean;
}

export default async function parseCompareUrl(): Promise<Comparison> {
	const baseRepo = getRepo()!;
	let baseBranch = await defaultBranchOfRepo.get(baseRepo);
	let headRepo = { ...baseRepo };
	let headBranch = baseBranch;

	let pathname = baseRepo.path;
	// Ensure the path starts with 'compare/'
	if (pathname.startsWith('compare/')) {
		const compareRegex = /compare\/([^./]+)(\.{2,3})([^./]+)/;
    const match = pathname.match(compareRegex)!;

		let heads: string | undefined;
		[,baseBranch, ,heads] = match;

		// Path: compare/main or compare/test/bun, heads is undefined
		if (heads) {
			const headParts = heads.split(':');
			if(headParts.length === 1) {
				// Path: compare/main...test/bun
				headBranch = headParts[0];
			}
			else if(headParts.length === 2) {
				// Path: compare/sandbox/keep-branch...yakov116:upstream
				[headRepo.owner, headBranch] = headParts;
				headRepo.nameWithOwner = `${headRepo.owner}/${headRepo.name}`;
			} else if(headParts.length === 3) {
				// Path: compare/main...refined-github:refined-github:rollup
				[headRepo.owner, headRepo.name, headBranch] = headParts;
				headRepo.nameWithOwner = `${headRepo.owner}/${headRepo.name}`;
			}
		}
	}

	return {
			base: {
					...baseRepo,
					branch: baseBranch
			},
			head: {
					...headRepo,
					branch: headBranch
			},
			isCrossRepo: headRepo.nameWithOwner !== baseRepo.nameWithOwner
	};
}
