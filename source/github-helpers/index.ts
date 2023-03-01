import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import compareVersions from 'tiny-version-compare';
import {RequireAtLeastOne} from 'type-fest';
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

export function getCurrentBranchFromFeed(): string | void {
	// Not `isRepoCommitList` because this works exclusively on the default branch
	if (getRepo()!.path !== 'commits') {
		return;
	}

	const feedLink = select('link[type="application/atom+xml"]')!;
	return new URL(feedLink.href)
		.pathname
		.split('/')
		.slice(4) // Drops the initial /user/repo/route/ part
		.join('/')
		.replace(/\.atom$/, '');
}

const typesWithCommittish = new Set(['tree', 'blob', 'blame', 'edit', 'commit', 'commits', 'compare']);
const titleWithCommittish = / at (?<branch>[.\w-/]+)( · [\w-]+\/[\w-]+)?$/i;
export const getCurrentCommittish = (pathname = location.pathname, title = document.title): string | undefined => {
	if (!pathname.startsWith('/')) {
		throw new TypeError(`Expected pathname starting with /, got "${pathname}"`);
	}

	const [type, unslashedCommittish] = pathname.split('/').slice(3);
	if (!type || !typesWithCommittish.has(type)) {
		// Root; or piece of information not applicable to the page
		return;
	}

	// Handle slashed branches in commits pages
	if (type === 'commits') {
		if (!unslashedCommittish) {
			return getCurrentBranchFromFeed()!;
		}

		const branchAndFilepath = pathname.split('/').slice(4).join('/');

		// List of all commits of current branch (no filename)
		if (title.startsWith('Commits · ')) {
			return branchAndFilepath;
		}

		// List of commits touching a particular file ("History")
		const filepath = /^History for ([^ ]+) - /.exec(title)![1];
		return branchAndFilepath.slice(0, branchAndFilepath.lastIndexOf('/' + filepath));
	}

	const parsedTitle = titleWithCommittish.exec(title);
	if (parsedTitle) {
		return parsedTitle.groups!.branch;
	}

	return unslashedCommittish;
};

export const isMac = navigator.userAgent.includes('Macintosh');

type Not<Yes, Not> = Yes extends Not ? never : Yes;
type UnslashedString<S extends string> = Not<S, `/${string}` | `${string}/`>;

export const buildRepoURL = <S extends string>(
	...pathParts: RequireAtLeastOne<Array<UnslashedString<S> | number>, 0>
): string => {
	// TODO: Drop after https://github.com/sindresorhus/type-fest/issues/417
	for (const part of pathParts) {
		if (typeof part === 'string' && /^\/|\/$/.test(part)) {
			throw new TypeError('The path parts shouldn’t start or end with a slash: ' + part);
		}
	}

	return [location.origin, getRepo()?.nameWithOwner, ...pathParts].join('/');
};

export function getForkedRepo(): string | undefined {
	return select('meta[name="octolytics-dimension-repository_parent_nwo"]')?.content;
}

export const parseTag = (tag: string): {version: string; namespace: string} => {
	const [, namespace = '', version = ''] = /(?:(.*)@)?([^@]+)/.exec(tag) ?? [];
	return {namespace, version};
};

export function compareNames(username: string, realname: string): boolean {
	return username.replace(/-/g, '').toLowerCase() === realname.normalize('NFD').replace(/[\u0300-\u036F\W.]/g, '').toLowerCase();
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

// https://github.com/idimetrix/text-case/blob/master/packages/upper-case-first/src/index.ts
export function upperCaseFirst(input: string): string {
	return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

// TODO: Drop after https://github.com/refined-github/github-url-detection/issues/85
/** Is tag or commit, with elementReady */
export async function isPermalink(): Promise<boolean> {
	if (/^[\da-f]{40}$/.test(getCurrentCommittish()!)) {
		// It's a commit
		return true;
	}

	await elementReady('[data-hotkey="w"]');
	return (
		// Pre "Latest commit design updates"
		/Tag|Tree/.test(select('[data-hotkey="w"] i')?.textContent ?? '') // Text appears in the branch selector

		// "Latest commit design updates"
		|| select.exists('[data-hotkey="w"] .octicon-tag') // Tags have an icon
	);
}

export function isRefinedGitHubRepo(): boolean {
	return location.pathname.startsWith('/refined-github/refined-github');
}

export function isAnyRefinedGitHubRepo(): boolean {
	return /^\/refined-github\/.+/.test(location.pathname);
}

export function isRefinedGitHubYoloRepo(): boolean {
	return location.pathname.startsWith('/refined-github/yolo');
}

export function shouldFeatureRun({
	/** Every condition must be true */
	asLongAs = [() => true],

	/** At least one condition must be true */
	include = [() => true],

	/** No conditions must be true */
	exclude = [() => false],
}): boolean {
	return asLongAs.every(c => c()) && include.some(c => c()) && exclude.every(c => !c());
}

export async function isArchivedRepoAsync(): Promise<boolean> {
	// Load the bare minimum for `isArchivedRepo` to work
	await elementReady('#repository-container-header');

	// DOM-based detection, we want awaitDomReady: false, so it needs to be here
	return pageDetect.isArchivedRepo();
}

export const userCanLikelyMergePR = (): boolean => select.exists('.discussion-sidebar-item .octicon-lock');

export const cacheByRepo = (): string => getRepo()!.nameWithOwner;
