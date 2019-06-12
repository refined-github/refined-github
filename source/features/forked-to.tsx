import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import cache from '../libs/cache';
import {getRepoURL} from '../libs/utils';
import {isOwnRepo} from '../libs/page-detect';

const id = 'forked-to';

const currentRepo = getRepoURL();

// Show cached forks.
async function showForks(): Promise<void> {
	const repo = getSourceRepo();
	const cached = await getCache(repo);
	const forks = cached.filter(fork => fork !== currentRepo);
	const pageHeader = select<HTMLElement>('.pagehead h1.public')!;
	for (const fork of forks) {
		pageHeader.append(
			<span className="fork-flag rgh-forked">
				<span className="text">forked to&nbsp;
					<a href={`/${fork}`}>{fork}</a>
				</span>
			</span>
		);
	}
}

// Store fork if we are on a forked page.
function checkForForkedPage(): void {
	if (!isOwnRepo()) {
		return;
	}

	const forkSourceElement = select<HTMLElement>('.fork-flag:not(.rgh-forked) a');
	if (forkSourceElement) {
		const forkedRepo = forkSourceElement.getAttribute('href')!.substring(1);
		storeCache(forkedRepo, currentRepo);
	}
}

// Watch for opening the fork dialog.
function watchForkDialog(): void {
	const forkDialog = select<HTMLElement>('details-dialog[src*="/fork"]')!;
	const forkFragment = select<HTMLElement>('include-fragment', forkDialog)!;
	forkFragment.addEventListener('load', () => {
		const repo = getSourceRepo();
		const forks = select.all<HTMLElement>('.octicon-repo-forked', forkDialog).map(forkElement => {
			return forkElement.parentNode!.textContent!.trim();
		});
		storeCache(repo, ...forks);
	});
}

// Get the source repo, by checking if we are already on a fork.
function getSourceRepo(): string {
	const forkSourceElement = select<HTMLElement>('.fork-flag:not(.rgh-forked) a');
	if (forkSourceElement) {
		return forkSourceElement.getAttribute('href')!.substring(1);
	}

	return currentRepo;
}

// Check if the fork still exists.
async function validateFork(repo: string): Promise<boolean> {
	const url = new URL(`/${repo}`, location.href);
	const response = await fetch(String(url),
		{
			method: 'HEAD'
		});
	return response.ok;
}

// Get cache and sort it.
async function getCache(repo: string): Promise<string[]> {
	const repoKey = `${id}:${repo}`;
	const cached = await cache.get<string[]>(repoKey) || [];
	const validForks = cached.filter(validateFork).sort(undefined);

	if (cached.length !== validForks.length) {
		await cache.set<string[]>(repoKey, validForks, 10);
	}

	return validForks;
}

// Save forks to cache.
async function storeCache(repo: string, ...forks: string[]): Promise<void> {
	const repoKey = `${id}:${repo}`;
	const cached = await cache.get<string[]>(repoKey) || [];
	for (const fork of forks) {
		if (!cached.includes(fork)) {
			cached.push(fork);
		}
	}

	await cache.set<string[]>(repoKey, cached, 10);
}

async function init(): Promise<void> {
	watchForkDialog();

	checkForForkedPage();

	showForks();
}

features.add({
	id,
	description: 'Add link to forked repo below the source',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
