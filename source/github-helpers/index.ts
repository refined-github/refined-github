import select from 'select-dom';
import oneTime from 'onetime';
import compareVersions from 'tiny-version-compare';
import {isPR, isIssue, utils} from 'github-url-detection';

// This never changes, so it can be cached here
export const getUsername = oneTime(utils.getUsername);
export const getRepoPath = utils.getRepoPath;
export const getCleanPathname = utils.getCleanPathname;

export const getDiscussionNumber = (): string | undefined => {
	if (isPR() || isIssue()) {
		return getCleanPathname().split('/')[3];
	}

	return undefined;
};

/* Should work on `isRepoTree` `isBlame` `isSingleFile` `isCommitList` `isCompare` `isPRCommit` */
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
export const prCommitRegex = new RegExp(`\\b${escapeRegex(location.origin)}[/][^/]+[/][^/]+[/]pull[/]\\d+[/]commits[/][0-9a-f]{7,40}\\b(?! \\]|\\))`, 'gi');

export function preventPrCommitLinkBreak(comment: string) {
	return comment.replace(prCommitRegex, '[$& ]($&)');
}
