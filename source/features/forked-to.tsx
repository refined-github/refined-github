import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {CheckIcon, ChevronRightIcon, TriangleDownIcon, XIcon} from '@primer/octicons-react';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import GitHubURL from '../github-helpers/github-url';
import {getUsername, getForkedRepo, getRepo} from '../github-helpers';

const getForkSourceRepo = (): string => getForkedRepo() ?? getRepo()!.nameWithOwner;
// eslint-disable-next-line import/prefer-default-export
export const getCacheKey = (): string => `forked-to:${getForkSourceRepo()}@${getUsername()!}`;

const updateCache = cache.function(async (): Promise<string[] | undefined> => {
	const document = await fetchDom(`/${getForkSourceRepo()}/fork?fragment=1`);
	const forks = select
		.all('.octicon-repo-forked', document)
		.map(({nextSibling}) => nextSibling!.textContent!.trim());

	return forks.length > 0 ? forks : undefined;
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 5},
	cacheKey: getCacheKey,
});

function createLink(baseRepo: string): string {
	if (pageDetect.isIssue() || pageDetect.isPR()) {
		return '/' + baseRepo;
	}

	const [user, repository] = baseRepo.split('/', 2);
	const url = new GitHubURL(location.href).assign({
		user,
		repository,
	});
	return url.pathname;
}

async function updateUI(forks: string[]): Promise<void> {
	// Don't add button if you're visiting the only fork available
	if (forks.length === 1 && forks[0] === getRepo()!.nameWithOwner) {
		return;
	}

	const forkButton = select('.pagehead-actions [aria-label^="Fork your own copy of"]')!;
	forkButton.classList.add('rounded-left-2', 'BtnGroup-item');

	if (forks.length === 1) {
		forkButton.after(
			<a
				href={createLink(forks[0])}
				className="btn btn-sm BtnGroup-item px-2 rgh-forked-button rgh-forked-link"
				title={`Open your fork at ${forks[0]}`}
			>
				<ChevronRightIcon className="v-align-text-top"/>
			</a>,
		);
	} else {
		forkButton.after(
			<details
				className="details-reset details-overlay BtnGroup-parent position-relative"
				id="rgh-forked-to-select-menu"
			>
				<summary
					className="btn btn-sm BtnGroup-item px-2 float-none rgh-forked-button"
				>
					<TriangleDownIcon className="v-align-text-top"/>
				</summary>
				<details-menu className="SelectMenu right-0">
					<div className="SelectMenu-modal">
						<div className="SelectMenu-header">
							<h3 className="SelectMenu-title">Your forks</h3>
							<button
								className="SelectMenu-closeButton"
								type="button"
								data-toggle-for="rgh-forked-to-select-menu"
							>
								<XIcon/>
							</button>
						</div>
						<div className="SelectMenu-list">
							{forks.map(fork => (
								<a
									href={createLink(fork)}
									className="rgh-forked-link SelectMenu-item"
									aria-checked={fork === getRepo()!.nameWithOwner ? 'true' : 'false'}
								>
									<CheckIcon className="SelectMenu-icon SelectMenu-icon--check"/>
									{fork}
								</a>
							))}
						</div>
					</div>
				</details-menu>
			</details>,
		);
	}
}

async function init(): Promise<void | false> {
	const forks = await cache.get<string[]>(getCacheKey());

	// If the feature has already run on this page, only update its links
	if (forks && select.exists('.rgh-forked-button')) {
		for (const fork of forks) {
			select(`a.rgh-forked-link[href^="/${fork}"]`)!.href = createLink(fork);
		}

		return;
	}

	if (forks) {
		await updateUI(forks);
	}

	// Only fetch/update forks when we see a fork (on the current page or in the cache).
	// This avoids having to `updateCache` for every single repo you visit.
	if (forks || pageDetect.isForkedRepo()) {
		await updateCache();
	} else {
		return false;
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	awaitDomReady: false,
	deduplicate: false,
	init,
});
