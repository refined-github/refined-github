import select from 'select-dom';
import onetime from 'onetime';
import stripIndent from 'strip-indent';
import {isRepo, isPR, isIssue}  from 'github-page-detection';
import compareVersions from 'tiny-version-compare';

export function logError(id: FeatureID, error: Error | string, ...extras: unknown[]): void {
	if (error instanceof TypeError && error.message === 'Object(...)(...) is null') {
		error.message = 'The element wasn’t found, the selector needs to be updated.';
	}

	const message = typeof error === 'string' ? error : error.message;

	if (message.includes('token')) {
		console.log(`ℹ️ Refined GitHub → ${id} →`, message);
		return;
	}

	// Don't change this to `throw Error` because Firefox doesn't show extensions' errors in the console.
	// Use `return` after calling this function.
	console.error(
		`❌ Refined GitHub → ${id} →`,
		error,
		...extras,
		stripIndent(`
			Search issue: https://github.com/sindresorhus/refined-github/issues?q=is%3Aissue+${encodeURIComponent(message)}

			Open an issue: https://github.com/sindresorhus/refined-github/issues/new?labels=bug&template=bug_report.md&title=${encodeURIComponent(`\`${id}\`: ${message}`)}
		`)
	);
}

export const getUsername = onetime(() => select('meta[name="user-login"]')!.getAttribute('content')!);

export const getDiscussionNumber = (): string | undefined => {
	if (isPR() || isIssue()) {
		return getCleanPathname().split('/')[3];
	}

	return undefined;
};

export const pluralize = (count: number, single: string, plural: string, zero?: string): string => {
	if (count === 0 && zero) {
		return zero.replace('$$', '0');
	}

	if (count === 1) {
		return single.replace('$$', '1');
	}

	return plural.replace('$$', String(count));
};

// Drops leading and trailing slash to avoid /\/?/ everywhere
export const getCleanPathname = (): string => location.pathname.replace(/^\/|\/$/g, '');

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

export const replaceBranch = (currentBranch: string, newBranch: string): string => {
	// `pageType` will be either `blob' or 'tree'
	const [pageType, ...branchAndPathParts] = getRepoPath()!.split('/');

	const newBranchRepoPath = branchAndPathParts.join('/').replace(currentBranch, newBranch);

	return `/${getRepoURL()}/${pageType}/${newBranchRepoPath}`;
};

export const getCurrentBranch = (): string => {
	return select.last<HTMLLinkElement>('link[rel="alternate"]')!
		.href
		.split('/')
		.slice(6)
		.join('/')
		.replace(/\.atom.*/, '');
};

export const isFirefox = navigator.userAgent.includes('Firefox/');

export const getRepoURL = (): string => location.pathname.slice(1).split('/', 2).join('/').toLowerCase();
export const getRepoGQL = (): string => {
	const {ownerName, repoName} = getOwnerAndRepo();
	return `owner: "${ownerName!}", name: "${repoName!}"`;
};

export const getOwnerAndRepo = (): {
	ownerName: string | undefined;
	repoName: string | undefined;
} => {
	const [, ownerName, repoName] = location.pathname.split('/', 3);
	return {ownerName, repoName};
};

export function getForkedRepo(): string | undefined {
	return select<HTMLAnchorElement>('.fork-flag a')?.pathname.slice(1);
}

export const getReference = (): string | undefined => {
	const pathnameParts = location.pathname.split('/');
	if (['commits', 'blob', 'tree', 'blame'].includes(pathnameParts[3])) {
		return pathnameParts[4];
	}

	return undefined;
};

export const parseTag = (tag: string): {version: string; namespace: string} => {
	const [, namespace = '', version = ''] = /(?:(.*)@)?([^@]+)/.exec(tag) ?? [];
	return {namespace, version};
};

export const groupBy = (iterable: Iterable<string>, grouper: (item: string) => string): Record<string, string[]> => {
	const map: Record<string, string[]> = {};

	for (const item of iterable) {
		const key = grouper(item);
		map[key] = map[key] ?? [];
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
			if (row.length > col) {
				zipped.push(row[col]);
				if (zipped.length === limit) {
					return zipped;
				}
			}
		}
	}

	return zipped;
};

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

/**
 * Prepend `:scope >` to a single or group of css selectors.
 * @param {string} selector A css selector.
 */
export function getScopedSelector(selector: string): string {
	return selector.split(',').map(sub => `:scope > ${sub.trim()}`).join(',');
}

export function looseParseInt(text: string): number {
	return Number(text.replace(/\D+/g, ''));
}

const validVersion = /^[vr]?\d+(?:\.\d+)+/;
const isPrerelease = /^[vr]?\d+(?:\.\d+)+(-\d)/;
export function getLatestVersionTag(tags: string[]): string {
	// Some tags aren't valid versions; comparison is meaningless.
	// Just use the latest tag returned by the API (reverse chronologically-sorted list)
	if (!tags.every(tag => validVersion.test(tag))) {
		return tags[0];
	}

	// Exclude pre-releases
	let releases = tags.filter(tag => !isPrerelease.test(tag));
	if (releases.length === 0) { // They were all pre-releases; undo.
		releases = tags;
	}

	let latestVersion = releases[0];
	for (const release of releases) {
		if (compareVersions(latestVersion, release) < 0) {
			latestVersion = release;
		}
	}

	return latestVersion;
}
