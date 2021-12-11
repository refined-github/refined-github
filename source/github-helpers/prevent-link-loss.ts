/* eslint-disable max-params */
import {getRepo} from '.';

const currentRepo = getRepo() ?? {nameWithOwner: 'refined-github/refined-github'};
function getRepoReference(repoNameWithOwner: string, delemiter = ''): string {
	return repoNameWithOwner === currentRepo.nameWithOwner ? '' : repoNameWithOwner + delemiter;
}

const escapeRegex = (string: string): string => string.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
const prCommitPathnameRegex = /[/]([^/]+[/][^/]+)[/]pull[/](\d+)[/]commits[/]([\da-f]{7})[\da-f]{33}(?:#[\w-]+)?\b/; // eslint-disable-line unicorn/better-regex
export const prCommitUrlRegex = new RegExp('\\b' + escapeRegex(location.origin) + prCommitPathnameRegex.source, 'gi');

const prComparePathnameRegex = /[/]([^/]+[/][^/]+)[/]compare[/](.+)(#diff-[\da-fR-]+)/; // eslint-disable-line unicorn/better-regex
export const prCompareUrlRegex = new RegExp('\\b' + escapeRegex(location.origin) + prComparePathnameRegex.source, 'gi');

const discussionPathnameRegex = /[/]([^/]+[/][^/]+)[/]discussions[/](\d+)[?][^#\s]+(#discussioncomment-\w+)?\b/; // eslint-disable-line unicorn/better-regex
export const discussionUrlRegex = new RegExp('\\b' + escapeRegex(location.origin) + discussionPathnameRegex.source, 'gi');

// To be used as replacer callback in string.replace() for PR commit links
export function preventPrCommitLinkLoss(url: string, repoNameWithOwner: string, pr: string, commit: string, index: number, fullText: string): string {
	if (fullText[index + url.length] === ')') {
		return url;
	}

	return `[${getRepoReference(repoNameWithOwner, '@')}\`${commit}\` (#${pr})](${url})`;
}

// To be used as replacer callback in string.replace() for compare links
export function preventPrCompareLinkLoss(url: string, repoNameWithOwner: string, compare: string, hash: string, index: number, fullText: string): string {
	if (fullText[index + url.length] === ')') {
		return url;
	}

	return `[${getRepoReference(repoNameWithOwner, '@')}\`${compare}\`${hash.slice(0, 16)}](${url})`;
}

// To be used as replacer callback in string.replace() for discussion links
export function preventDiscussionLinkLoss(url: string, repoNameWithOwner: string, discussion: string, comment: string, index: number, fullText: string): string {
	if (fullText[index + url.length] === ')') {
		return url;
	}

	return `[${getRepoReference(repoNameWithOwner)}#${discussion}${comment ? ' (comment)' : ''}](${url})`;
}
