import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';
import PlusIcon from 'octicons-plain-react/Plus';
import TagIcon from 'octicons-plain-react/Tag';
import {elementExists} from 'select-dom';
import {$optional} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import api from '../github-helpers/api.js';
import {
	buildRepoURL,
	cacheByRepo,
	getLatestVersionTag,
	getRepo,
} from '../github-helpers/index.js';
import isDefaultBranch from '../github-helpers/is-default-branch.js';
import pluralize from '../helpers/pluralize.js';
import {branchSelector} from '../github-helpers/selectors.js';
import getPublishRepoState from './unreleased-commits.gql';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import abbreviateString from '../helpers/abbreviate-string.js';
import {wrapAll} from '../helpers/dom-utils.js';
import {groupButtons} from '../github-helpers/group-buttons.js';
import {expectToken} from '../github-helpers/github-token.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';

type RepoPublishState = {
	latestTag: string | false;
	aheadBy: number;
};

type Tags = {
	name: string;
	tag: {
		history?: {totalCount: number}; // Lightweight tag (Commit)
		commit?: {
			history?: {totalCount: number}; // Annotated tag (Tag → Commit)
		};
	};
};

const repoPublishState = new CachedFunction('tag-ahead-by', {
	async updater(): Promise<RepoPublishState> {
		const {repository} = await api.v4(getPublishRepoState);

		if (repository.refs.nodes.length === 0) {
			return {
				latestTag: false,
				aheadBy: 0,
			};
		}

		const tags = new Map<string, number>();
		for (const node of repository.refs.nodes as Tags[]) {
			const totalCount = node.tag.commit?.history?.totalCount ?? node.tag.history?.totalCount;
			if (totalCount !== undefined) {
				tags.set(node.name, totalCount);
			}
		}

		const latestTag = getLatestVersionTag([...tags.keys()]);
		const latestTagTotalCount = tags.get(latestTag)!;
		const headTotalCount = repository.defaultBranchRef.target.history.totalCount;
		const aheadBy = headTotalCount - latestTagTotalCount;

		return {
			latestTag,
			aheadBy,
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
	const label = `${pluralize(aheadBy, '$$ unreleased commit')}\nsince ${abbreviateString(latestTag, 30)}`;

	return (
		<a
			className="btn px-2 tooltipped tooltipped-se"
			href={buildRepoURL('compare', `${latestTag}...${await getDefaultBranch()}`)}
			aria-label={label}
		>
			<TagIcon className="v-align-middle" />
			<sup className="ml-n2"> +{aheadBy}</sup>
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
			href={buildRepoURL('releases/new')}
			className="btn px-2 tooltipped tooltipped-se"
			aria-label="Draft a new release"
			data-turbo-frame="repo-content-turbo-frame"
		>
			<PlusIcon className="v-align-middle" />
		</a>,
	]);
}

async function addToHome(branchSelector: HTMLButtonElement): Promise<void> {
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
		branchSelector,
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

async function initHome(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe(branchSelector, addToHome, {signal});
}

async function initReleases(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe('input#release-filter', addToReleases, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isDefaultBranch,
	],
	include: [
		pageDetect.isRepoHome,
	],
	init: initHome,
}, {
	include: [
		// Only first page of Releases
		() => getRepo()?.path === 'releases',
	],
	init: initReleases,
});

/*

Test URLs

Repo with no tags (no button)
https://github.com/refined-github/yolo

Repo with many unreleased commits (exact count shown)
https://github.com/refined-github/sandbox

Repo with some unreleased commits
https://github.com/refined-github/refined-github

Releases page with unreleased commits
https://github.com/facebook/react/releases

Releases page with unreleased commits (user can release)
https://github.com/refined-github/refined-github/releases

Releases page with changelog file
https://github.com/fczbkk/css-selector-generator/releases

*/
