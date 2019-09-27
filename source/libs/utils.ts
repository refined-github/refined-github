import select from 'select-dom';
import onetime from 'onetime';
import {isRepo, isPR, isIssue} from './page-detect';

export const getUsername = onetime(() => select('meta[name="user-login"]')!.getAttribute('content')!);

export const getDiscussionNumber = (): string | false => (isPR() || isIssue()) && getCleanPathname().split('/')[3];

// Drops leading and trailing slash to avoid /\/?/ everywhere
export const getCleanPathname = (): string => location.pathname.replace(/^[/]|[/]$/g, '');

// Parses a repo's subpage, e.g.
// '/user/repo/issues/' -> 'issues'
// '/user/repo/' -> ''
// returns undefined if the path is not a repo
export const getRepoPath = (): string | undefined => {
	if (isRepo()) {
		return getCleanPathname().split('/').slice(2).join('/');
	}

	return undefined;
};

export const getRepoBranch = (): string | false => {
	const [type, branch] = getCleanPathname().split('/').slice(2);
	if (isRepo() && type === 'tree') {
		return branch;
	}

	return false;
};

export const replaceBranch = (currentBranch: string, newBranch: string): string => {
	// `pageType` will be either `blob' or 'tree'
	const [pageType, ...branchAndPathParts] = getRepoPath()!.split('/');

	const newBranchRepoPath = branchAndPathParts.join('/').replace(currentBranch, newBranch);

	return `/${getRepoURL()}/${pageType}/${newBranchRepoPath}`;
};

export const getCurrentBranch = (): string => {
	return select<HTMLLinkElement>('link[rel="alternate"]')!
		.href
		.split('/')
		.slice(6)
		.join('/')
		.replace(/\.atom.*/, '');
};

export const getRepoURL = (): string => location.pathname.slice(1).split('/', 2).join('/');
export const getRepoGQL = (): string => {
	const {ownerName, repoName} = getOwnerAndRepo();
	return `owner: "${ownerName}", name: "${repoName}"`;
};

export const getOwnerAndRepo = (): {
	ownerName: string;
	repoName: string;
} => {
	const [, ownerName, repoName] = location.pathname.split('/', 3);
	return {ownerName, repoName};
};

export const getRef = (): string | undefined => {
	const pathnameParts = location.pathname.split('/');
	if (['commits', 'blob', 'tree', 'blame'].includes(pathnameParts[3])) {
		return pathnameParts[4];
	}

	return undefined;
};

export const parseTag = (tag: string): {version: string; namespace: string} => {
	const [, namespace = '', version = ''] = /(?:(.*)@)?([^@]+)/.exec(tag) || [];
	return {namespace, version};
};

export const groupBy = (iterable: Iterable<string>, grouper: (item: string) => string): Record<string, string[]> => {
	const map: Record<string, string[]> = {};

	for (const item of iterable) {
		const key = grouper(item);
		map[key] = map[key] || [];
		map[key].push(item);
	}

	return map;
};

// Concats arrays but does so like a zipper instead of appending them
// [[0, 1, 2], [0, 1]] => [0, 0, 1, 1, 2]
// Like lodash.zip
export const flatZip = <T>(table: T[][], limit = Infinity): T[] => {
	const maxColumns = Math.max(...table.map(row => row.length));
	const zipped = [];
	for (let col = 0; col < maxColumns; col++) {
		for (const row of table) {
			if (row[col]) {
				zipped.push(row[col]);
				if (zipped.length === limit) {
					return zipped;
				}
			}
		}
	}

	return zipped;
};

export function getOP(): string {
	if (isPR()) {
		const titleRegex = /^(.+) by (\S+) · Pull Request #(\d+)/;
		const match = titleRegex.exec(document.title)!;
		return match && match[2];
	}

	return select('.timeline-comment-header-text .author')!.textContent!;
}

export function compareNames(username: string, realname: string): boolean {
	return username.replace(/-/g, '').toLowerCase() === realname.normalize('NFD').replace(/[\u0300-\u036F\W.]/g, '').toLowerCase();
}

export async function poll<T>(callback: () => T, frequency: number): Promise<T> {
	return new Promise(resolve => {
		(function loop() {
			const result = callback();
			if (result !== null && typeof result !== undefined) {
				resolve(result);
			} else {
				setTimeout(loop, frequency);
			}
		})();
	});
}

export function reportBug(featureName: string, bugName: string): void {
	alert(`Refined GitHub: ${bugName}. Can you report this issue? You’ll find more information in the console.`);
	const issuesUrl = new URL('https://github.com/sindresorhus/refined-github/issues');
	const newIssueUrl = new URL('https://github.com/sindresorhus/refined-github/new?labels=bug&template=bug_report.md');
	issuesUrl.searchParams.set('q', `is:issue ${featureName}`);
	newIssueUrl.searchParams.set('title', `\`${featureName}\` ${bugName}`);
	console.log('Find existing issues:\n' + String(issuesUrl));
	console.log('Open new issue:\n' + String(newIssueUrl));
}
