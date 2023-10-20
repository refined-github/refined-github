import {$, elementExists} from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import compareVersions from 'tiny-version-compare';
import {RequireAtLeastOne} from 'type-fest';
import * as pageDetect from 'github-url-detection';
import mem from 'mem';

import {branchSelector} from './selectors.js';

// This never changes, so it can be cached here
export const getUsername = onetime(pageDetect.utils.getUsername);
export const {getRepositoryInfo: getRepo, getCleanPathname} = pageDetect.utils;

export function getConversationNumber(): number | undefined {
	if (pageDetect.isPR() || pageDetect.isIssue()) {
		return Number(location.pathname.split('/')[4]);
	}

	return undefined;
}

export const isMac = navigator.userAgent.includes('Macintosh');

type Not<Yes, Not> = Yes extends Not ? never : Yes;
type UnslashedString<S extends string> = Not<S, `/${string}` | `${string}/`>;

export function buildRepoURL<S extends string>(...pathParts: RequireAtLeastOne<Array<UnslashedString<S> | number>, 0>): string {
	// TODO: Drop after https://github.com/sindresorhus/type-fest/issues/417
	for (const part of pathParts) {
		if (typeof part === 'string' && /^\/|\/$/.test(part)) {
			throw new TypeError('The path parts shouldn’t start or end with a slash: ' + part);
		}
	}

	return [location.origin, getRepo()?.nameWithOwner, ...pathParts].join('/');
}

export function getForkedRepo(): string | undefined {
	return $('meta[name="octolytics-dimension-repository_parent_nwo"]')?.content;
}

export function parseTag(tag: string): {version: string; namespace: string} {
	const [, namespace = '', version = ''] = /(?:(.*)@)?([^@]+)/.exec(tag) ?? [];
	return {namespace, version};
}

export function compareNames(username: string, realname: string): boolean {
	return username.replaceAll('-', '').toLowerCase() === realname.normalize('NFD').replaceAll(/[\u0300-\u036F\W.]/g, '').toLowerCase();
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

const cachePerPage = {
	cacheKey: () => location.pathname,
};

/** Is tag or commit, with elementReady */
export const isPermalink = mem(async () => {
	// No need for getCurrentGitRef(), it's a simple and exact check
	if (/^[\da-f]{40}$/.test(location.pathname.split('/')[4])) {
		// It's a commit
		return true;
	}

	// Awaiting only the branch selector means it resolves early even if the icon tag doesn't exist, whereas awaiting the icon tag would wait for the DOM ready event before resolving.
	return elementExists(
		'.octicon-tag', // Tags have an icon
		await elementReady(branchSelector),
	);
}, cachePerPage);

export function isRefinedGitHubRepo(): boolean {
	return location.pathname.startsWith('/refined-github/refined-github');
}

export function isAnyRefinedGitHubRepo(): boolean {
	return /^\/refined-github\/.+/.test(location.pathname);
}

export function isRefinedGitHubYoloRepo(): boolean {
	return location.pathname.startsWith('/refined-github/yolo');
}

export async function isArchivedRepoAsync(): Promise<boolean> {
	// Load the bare minimum for `isArchivedRepo` to work
	await elementReady('main > div');

	// DOM-based detection, we want awaitDomReady: false, so it needs to be here
	return pageDetect.isArchivedRepo();
}

export const userCanLikelyMergePR = (): boolean => elementExists('.discussion-sidebar-item .octicon-lock');

export const cacheByRepo = (): string => getRepo()!.nameWithOwner;

// Commit lists for files and folders lack a branch selector
export const isRepoCommitListRoot = (): boolean => pageDetect.isRepoCommitList() && document.title.startsWith('Commits');

export const isUrlReachable = mem(async (url: string): Promise<boolean> => {
	const {ok} = await fetch(url, {method: 'head'});
	return ok;
});

// Don't make the argument optional, sometimes we really expect it to exist and want to throw an error
export function extractCurrentBranchFromBranchPicker(branchPicker: HTMLElement): string {
	return branchPicker.title === 'Switch branches or tags'
		? branchPicker.textContent.trim() // Branch name is shown in full
		: branchPicker.title; // Branch name was clipped, so they placed it in the title attribute
}

export function addAfterBranchSelector(branchSelectorParent: HTMLDetailsElement, sibling: HTMLElement): void {
	const row = branchSelectorParent.closest('.position-relative')!;
	row.classList.add('d-flex', 'flex-shrink-0', 'gap-2');
	row.append(sibling);
}

/** Trigger a reflow to push the right-most tab into the overflow dropdown */
export function triggerRepoNavOverflow(): void {
	window.dispatchEvent(new Event('resize'));
}
