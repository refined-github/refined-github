import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import cache from '../libs/cache';
import {getRepoURL} from '../libs/utils';
import {isOwnRepo} from '../libs/page-detect';

const getCacheKey = (repo: string): string => `forked-to:${repo}`;

async function showForks(): Promise<void> {
	const cached = await getValidatedCache(getSourceRepo());
	const pageHeader = select('.pagehead h1.public')!;
	for (const fork of cached.filter(fork => fork !== getRepoURL())) {
		pageHeader.append(
			<span className="fork-flag rgh-forked">
				<span className="text">forked to&nbsp;
					<a href={`/${fork}`}>{fork}</a>
				</span>
			</span>
		);
	}
}

function rememberCurrentFork(): void {
	if (!isOwnRepo()) {
		return;
	}

	const forkSourceElement = select<HTMLAnchorElement>('.fork-flag:not(.rgh-forked) a');
	if (forkSourceElement) {
		const forkedRepo = forkSourceElement.pathname.substring(1);
		addAndStoreCache(forkedRepo, getRepoURL());
	}
}

function watchForkDialog(): void {
	const forkDialog = select<HTMLElement>('details-dialog[src*="/fork"]')!;
	const forkFragment = select<HTMLElement>('include-fragment', forkDialog)!;
	forkFragment.addEventListener('load', () => {
		const repo = getSourceRepo();
		const forks = select.all<HTMLElement>('.octicon-repo-forked', forkDialog).map(forkElement => {
			return forkElement.parentNode!.textContent!.trim();
		});
		addAndStoreCache(repo, ...forks);
	});
}

function getSourceRepo(): string {
	const forkSourceElement = select<HTMLAnchorElement>('.fork-flag:not(.rgh-forked) a');
	if (forkSourceElement) {
		return forkSourceElement.pathname.substring(1);
	}

	return getRepoURL();
}

async function validateFork(repo: string): Promise<boolean> {
	const response = await fetch(location.origin + '/' + repo,
		{
			method: 'HEAD'
		});
	return response.ok;
}

async function getValidatedCache(repo: string): Promise<string[]> {
	const cached = await cache.get<string[]>(getCacheKey(repo)) || [];
	const validForks = cached.filter(validateFork).sort(undefined);

	if (cached.length !== validForks.length) {
		await cache.set<string[]>(getCacheKey(repo), validForks, 10);
	}

	return validForks;
}

async function addAndStoreCache(repo: string, ...forks: string[]): Promise<void> {
	const cached = await cache.get<string[]>(getCacheKey(repo)) || [];
	for (const fork of forks) {
		if (!cached.includes(fork)) {
			cached.push(fork);
		}
	}

	await cache.set<string[]>(getCacheKey(repo), cached, 10);
}

async function init(): Promise<void> {
	watchForkDialog();

	rememberCurrentFork();

	showForks();
}

features.add({
	id: 'forked-to',
	description: 'Add link to forked repo below the source',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
