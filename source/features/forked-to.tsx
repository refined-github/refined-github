import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import pFilter from 'p-filter';
import onetime from 'onetime';
import features from '../libs/features';
import {isRepoWithAccess} from '../libs/page-detect';
import {getRepoURL, getUsername} from '../libs/utils';

const getCacheKey = onetime((): string => `forked-to:${getUsername()}@${findForkedRepo() || getRepoURL()}`);

async function save(forks: string[]): Promise<void> {
	if (forks.length === 0) {
		return cache.delete(getCacheKey());
	}

	return cache.set(getCacheKey(), forks, 10);
}

async function saveAllForks(): Promise<void> {
	const forks = select
		.all('details-dialog[src*="/fork"] .octicon-repo-forked')
		.map(({nextSibling}) => nextSibling!.textContent!.trim());

	save(forks);
}

function findForkedRepo(): string | undefined {
	const forkSourceElement = select<HTMLAnchorElement>('.fork-flag:not(.rgh-forked) a');
	if (forkSourceElement) {
		return forkSourceElement.pathname.slice(1);
	}

	return undefined;
}

async function validateFork(repo: string): Promise<boolean> {
	const response = await fetch(location.origin + '/' + repo, {method: 'HEAD'});
	return response.ok;
}

async function updateForks(forks: string[]): Promise<void> {
	// Don't validate current page: it exists; it won't be shown in the list; it will be added later anyway
	const validForks = await pFilter(forks.filter(fork => fork !== getRepoURL()), validateFork);

	// Add current repo to cache if it's a fork
	if (isRepoWithAccess() && findForkedRepo()) {
		save([...validForks, getRepoURL()].sort(undefined));
	} else {
		save(validForks);
	}
}

async function init(): Promise<void> {
	select('details-dialog[src*="/fork"] include-fragment')!
		.addEventListener('load', saveAllForks);

	const forks = await cache.get<string[]>(getCacheKey());

	if (forks) {
		const pageHeader = select('.pagehead h1.public')!;
		for (const fork of forks.filter(fork => fork !== getRepoURL())) {
			pageHeader.append(
				<span className="fork-flag rgh-forked">
					forked to <a href={`/${fork}`}>{fork}</a>
				</span>
			);
		}
	}

	// Validate cache after showing links once, to make it faster
	await updateForks(forks || []);
}

features.add({
	id: __featureName__,
	description: 'Your repo forks are shown under the repo title',
	screenshot: 'https://user-images.githubusercontent.com/55841/60543588-f5c9df80-9d16-11e9-8667-52ff16b2cb16.png',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
