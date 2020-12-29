import onetime from 'onetime';
import elementReady from 'element-ready';
import compareVersions from 'tiny-version-compare';
import * as pageDetect from 'github-url-detection';

// This never changes, so it can be cached here
export const getUsername = onetime(pageDetect.utils.getUsername);
export const {getRepositoryInfo: getRepo, getCleanPathname} = pageDetect.utils;

export const getConversationNumber = (): string | undefined => {
	if (pageDetect.isPR() || pageDetect.isIssue()) {
		return location.pathname.split('/')[4];
	}

	return undefined;
};

/**
Tested on isRepoTree, isBlame, isSingleFile, isEditFile, isSingleCommit, isCommitList, isCompare. Subtly incompatible with isPR
Example tag content on public repositories: https://github.com/sindresorhus/refined-github/commits/branch-or-commit/even/with/slashes.atom
Example tag content on private repositories https://github.com/private/private/commits/master.atom?token=AEAXKWNRHXA2XJ2ZWCMGUUN44LM62
*/
export const getCurrentBranch = (): string | undefined => {
	// .last needed for #2799
	const feedLink = $last('link[type="application/atom+xml"]');
	// The feedLink is not available on `isIssue` #3641
	if (!feedLink) {
		return;
	}

	return new URL(feedLink.href)
		.pathname
		.split('/')
		.slice(4) // Drops the initial /user/repo/route/ part
		.join('/')
		.replace(/\.atom$/, '');
};

export const isFirefox = navigator.userAgent.includes('Firefox/');

// The type requires at least one parameter https://stackoverflow.com/a/49910890
export const buildRepoURL = (...pathParts: Array<string | number> & {0: string}): string => {
	for (const part of pathParts) {
		// TODO: Can TypeScript take care of this? With https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#template-literal-types
		if (typeof part === 'string' && /^\/|\/$/.test(part)) {
			throw new TypeError('The path parts shouldn’t start or end with a slash: ' + part);
		}
	}

	return [location.origin, getRepo()?.nameWithOwner, ...pathParts].join('/');
};

export const getPRHeadRepo = (): ReturnType<typeof getRepo> => {
	return getRepo($('.commit-ref.head-ref a')!);
};

export function getForkedRepo(): string | undefined {
	return $('meta[name="octolytics-dimension-repository_parent_nwo"]')?.content;
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
	return selector.split(',').map(sub => `:scope > ${sub.trim()}`).join();
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

const escapeRegex = (string: string): string => string.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
const prCommitPathnameRegex = /[/][^/]+[/][^/]+[/]pull[/](\d+)[/]commits[/]([\da-f]{7})[\da-f]{33}(?:#[\w-]+)?\b/; // eslint-disable-line unicorn/better-regex
export const prCommitUrlRegex = new RegExp('\\b' + escapeRegex(location.origin) + prCommitPathnameRegex.source, 'gi');

const prComparePathnameRegex = /[/][^/]+[/][^/]+[/]compare[/](.+)(#diff-[\da-fR-]+)/; // eslint-disable-line unicorn/better-regex
export const prCompareUrlRegex = new RegExp('\\b' + escapeRegex(location.origin) + prComparePathnameRegex.source, 'gi');

// To be used as replacer callback in string.replace()
export function preventPrCommitLinkLoss(url: string, pr: string, commit: string, index: number, fullText: string): string {
	if (fullText[index + url.length] === ')') {
		return url;
	}

	return `[\`${commit}\` (#${pr})](${url})`;
}

// To be  used as replacer callback in string.replace() for compare links
export function preventPrCompareLinkLoss(url: string, compare: string, hash: string, index: number, fullText: string): string {
	if (fullText[index + url.length] === ')') {
		return url;
	}

	return `[\`${compare}\`${hash.slice(0, 16)}](${url})`;
}

// https://github.com/idimetrix/text-case/blob/master/packages/upper-case-first/src/index.ts
export function upperCaseFirst(input: string): string {
	return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

/** Is tag or commit, with elementReady */
export async function isPermalink(): Promise<boolean> {
	if (/^[\da-f]{40}$/.test(getCurrentBranch()!)) {
		// It's a commit
		return true;
	}

	await elementReady('[data-hotkey="w"]');
	return (
		// Pre "Latest commit design updates"
		/Tag|Tree/.test($('[data-hotkey="w"] i')?.textContent!) || // Text appears in the branch selector

		// "Latest commit design updates"
		$exists('[data-hotkey="w"] .octicon-tag') // Tags have an icon
	);
}
