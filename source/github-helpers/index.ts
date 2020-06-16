import select from 'select-dom';
import oneTime from 'onetime';
import compareVersions from 'tiny-version-compare';
import * as pageDetect from 'github-url-detection/esm/index.js'; // eslint-disable-line import/extensions -- Required for Node tests compatibility

// This never changes, so it can be cached here
export const getUsername = oneTime(pageDetect.utils.getUsername);
export const {getRepoPath, getCleanPathname} = pageDetect.utils;

export const getDiscussionNumber = (): string | undefined => {
	if (pageDetect.isPR() || pageDetect.isIssue()) {
		return getCleanPathname().split('/')[3];
	}

	return undefined;
};

/**
Tested on isRepoTree, isBlame, isSingleFile, isEditFile, isSingleCommit, isCommitList, isCompare. Subtly incompatible with isPR
Example tag content on public repositories: https://github.com/sindresorhus/refined-github/commits/branch-or-commit/even/with/slashes.atom
Example tag content on private repositories https://github.com/private/private/commits/master.atom?token=AEAXKWNRHXA2XJ2ZWCMGUUN44LM62
*/
export const getCurrentBranch = (): string => {
	// .last needed for #2799
	return new URL(select.last<HTMLLinkElement>('[type="application/atom+xml"]')!.href)
		.pathname
		.split('/')
		.slice(4) // Drops the initial /user/repo/route/ part
		.join('/')
		.replace(/\.atom$/, '');
};

export const isFirefox = navigator.userAgent.includes('Firefox/');

export const getRepoURL = (): string => location.pathname.slice(1).split('/', 2).join('/').toLowerCase();
export const getRepoGQL = (): string => {
	const {ownerName, repoName} = getOwnerAndRepo();
	return `owner: "${ownerName!}", name: "${repoName!}"`;
};

export const getOwnerAndRepo = (): {
	ownerName?: string;
	repoName?: string;
} => {
	const [, ownerName, repoName] = location.pathname.split('/', 3);
	return {ownerName, repoName};
};

export function getForkedRepo(): string | undefined {
	return select<HTMLAnchorElement>('.fork-flag a')?.pathname.slice(1);
}

export const parseTag = (tag: string): {version: string; namespace: string} => {
	const [, namespace = '', version = ''] = /(?:(.*)@)?([^@]+)/.exec(tag) ?? [];
	return {namespace, version};
};

export function compareNames(username: string, realname: string): boolean {
	return username.replace(/-/g, '').toLowerCase() === realname.normalize('NFD').replace(/[\u0300-\u036F\W.]/g, '').toLowerCase();
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

const escapeRegex = (string: string) => string.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
const prCommitPathnameRegex = /[/][^/]+[/][^/]+[/]pull[/](\d+)[/]commits[/]([\da-f]{7})[\da-f]{33}(?:#[\w-]+)?\b/; // eslint-disable-line unicorn/better-regex
export const prCommitUrlRegex = new RegExp('\\b' + escapeRegex(location.origin) + prCommitPathnameRegex.source, 'gi');

// To be used as replacer callback in string.replace()
export function preventPrCommitLinkLoss(url: string, pr: string, commit: string, index: number, fullText: string): string {
	if (fullText[index + url.length] === ')') {
		return url;
	}

	return `[\`${commit}\` (#${pr})](${url})`;
}
