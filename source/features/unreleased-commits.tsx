import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import PlusIcon from 'octicons-plain-react/Plus';
import TagIcon from 'octicons-plain-react/Tag';
import {$optional, elementExists} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';
import {groupButtons} from '../github-helpers/group-buttons.js';
import {buildRepoUrl, cacheByRepo, getLatestVersionTag, getRepo} from '../github-helpers/index.js';
import isDefaultBranch from '../github-helpers/is-default-branch.js';
import {branchSelector} from '../github-helpers/selectors.js';
import abbreviateString from '../helpers/abbreviate-string.js';
import {wrapAll} from '../helpers/dom-utils.js';
import pluralize from '../helpers/pluralize.js';
import observe from '../helpers/selector-observer.js';
import getPublishRepoState from './unreleased-commits.gql';

type RepoPublishState = {
	latestTag: string | false;
	aheadBy: number;
};

type Tag = {
	name: string;
	tag: {
		oid: string;
		commit?: {
			oid: string;
		};
	};
};

const undeterminableAheadBy = Number.MAX_SAFE_INTEGER; // For when the branch is ahead by more than 20 commits #5505

const repoPublishState = new CachedFunction('tag-ahead-by', {
	async updater(): Promise<RepoPublishState> {
		const {repository} = await api.v4(getPublishRepoState);

		if (repository.refs.nodes.length === 0) {
			return {
				latestTag: false,
				aheadBy: 0,
			};
		}

		const tags = new Map<string, string>();
		for (const node of repository.refs.nodes as Tag[]) {
			// The commit might be missing on "lightweight" tags, so the code defaults to the tag.oid instead
			tags.set(node.name, node.tag.commit?.oid ?? node.tag.oid);
		}

		// If this logic ever gets dropped or becomes simpler, consider using the native "compare" API
		// https://github.com/refined-github/refined-github/issues/6094
		const latestTag = getLatestVersionTag([...tags.keys()]);
		const latestTagOid = tags.get(latestTag)!;
		const aheadBy = repository.defaultBranchRef.target.history.nodes.findIndex((node: AnyObject) =>
			node.oid === latestTagOid,
		);

		return {
			latestTag,
			aheadBy: aheadBy === -1 ? undeterminableAheadBy : aheadBy,
		};
	},
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 2},
	cacheKey: cacheByRepo,
});

async function createLink(
	latestTag: string,
	aheadBy: number,
): Promise<HTMLElement> {
	const commitCount = aheadBy === undeterminableAheadBy
		? 'More than 20 unreleased commits'
		: pluralize(aheadBy, '$$ unreleased commit');
	const label = `${commitCount}\nsince ${abbreviateString(latestTag, 30)}`;

	return (
		<a
			className="btn px-2 tmp-px-2 tooltipped tooltipped-se"
			href={buildRepoUrl('compare', `${latestTag}...${await getDefaultBranch()}`)}
			aria-label={label}
		>
			<TagIcon />
			{' '}
			{aheadBy === undeterminableAheadBy || <sup className="ml-n2 tmp-ml-n2">+{aheadBy}</sup>}
		</a>
	);
}

async function createLinkGroup(latestTag: string, aheadBy: number): Promise<HTMLElement> {
	const link = await createLink(latestTag, aheadBy);
	if (!(await userHasPushAccess())) {
		return link;
	}

	return groupButtons([
		link,
		// `aria-label` wording taken from $user/$repo/releases page
		<a
			href={buildRepoUrl('releases/new')}
			className="btn px-2 tmp-px-2 tooltipped tooltipped-se"
			aria-label="Draft a new release"
			data-turbo-frame="repo-content-turbo-frame"
		>
			<PlusIcon />
		</a>,
	]);
}

async function addToHome(branchSelectorElement: HTMLButtonElement): Promise<void> {
	// React issues. Duplicates appear after a color scheme update
	// https://github.com/refined-github/refined-github/issues/7536
	if (elementExists('.rgh-unreleased-commits-wrapper')) {
		return;
	}

	const {latestTag, aheadBy} = await repoPublishState.get();
	const isAhead = aheadBy > 0;

	if (!latestTag || !isAhead) {
		return;
	}

	const linkGroup = await createLinkGroup(latestTag, aheadBy);
	linkGroup.style.flexShrink = '0';

	wrapAll(
		<div className="d-flex gap-2 rgh-unreleased-commits-wrapper" />,
		branchSelectorElement,
		linkGroup,
	);
}

async function addToReleases(releasesFilter: HTMLInputElement): Promise<void> {
	const {latestTag, aheadBy} = await repoPublishState.get();
	const isAhead = aheadBy > 0;

	if (!latestTag || !isAhead) {
		return;
	}

	const widget = await createLink(latestTag, aheadBy);

	// Prepend it to the existing "Draft a new release" button to match the button on the repo home
	const newReleaseButton = $optional('nav + div a[href$="/releases/new"]');
	if (newReleaseButton) {
		newReleaseButton.before(widget);
		groupButtons([
			widget,
			newReleaseButton,
		]);
		return;
	}

	// Otherwise, add it before filter input
	releasesFilter.form!.before(widget);
	releasesFilter.form!.parentElement!.classList.add('d-flex', 'flex-items-start');
	// The form has .ml-md-2, this restores it on `sm`
	widget.classList.add('mr-md-0', 'mr-2');
}

async function addToNewRelease(header: HTMLElement): Promise<void> {
	const {latestTag, aheadBy} = await repoPublishState.get();
	const isAhead = aheadBy > 0;

	if (!latestTag || !isAhead) {
		return;
	}

	const defaultBranch = await getDefaultBranch();

	header.append(
		' ',
		<a target="_blank" href={buildRepoUrl('compare', `${latestTag}...${defaultBranch}`)}>
			{pluralize(aheadBy, '$$ unreleased commit')}
		</a>,
		` on ${defaultBranch} since `,
		<a target="_blank" href={buildRepoUrl('releases', latestTag)}>
			{abbreviateString(latestTag, 30)}
		</a>,
	);
}

function initHome(signal: AbortSignal): void {
	observe(branchSelector, addToHome, {signal});
}

function initReleases(signal: AbortSignal): void {
	observe('input#release-filter', addToReleases, {signal});
}

function initNewRelease(signal: AbortSignal): void {
	observe('.js-tag-status-message[data-state="empty"]', addToNewRelease, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isDefaultBranch,
	],
	include: [
		pageDetect.isRepoHome,
	],
	requiresToken: true,
	init: initHome,
}, {
	include: [
		// Only first page of Releases
		() => getRepo()?.path === 'releases',
	],
	requiresToken: true,
	init: initReleases,
}, {
	include: [
		// Detections run on all pages, even not repos
		() => getRepo()?.path === 'releases/new',
	],
	requiresToken: true,
	init: initNewRelease,
});

/*

Test URLs

Repo with no tags (no button)
https://github.com/refined-github/yolo

Repo with too many unreleased commits
https://github.com/refined-github/sandbox

Repo with some unreleased commits
https://github.com/refined-github/refined-github

Releases page with unreleased commits
https://github.com/facebook/react/releases

Releases page with unreleased commits (user can release)
https://github.com/refined-github/refined-github/releases

Releases page with changelog file
https://github.com/fczbkk/css-selector-generator/releases

Realeasing a new version
https://github.com/refined-github/refined-github/releases/new

*/
