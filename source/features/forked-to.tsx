import './forked-to.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import pFilter from 'p-filter';
import onetime from 'onetime';
import features from '../libs/features';
import {isRepoWithAccess} from '../libs/page-detect';
import {getRepoURL, getUsername} from '../libs/utils';
import * as icons from '../libs/icons';

const getCacheKey = onetime((): string => `forked-to:${getUsername()}@${findForkedRepo() || getRepoURL()}`);

async function save(forks: string[]): Promise<void> {
	if (forks.length === 0) {
		return cache.delete(getCacheKey());
	}

	return cache.set(getCacheKey(), forks, 10);
}

function saveAllForks(): void {
	const forks = select
		.all('details-dialog[src*="/fork"] .octicon-repo-forked')
		.map(({nextSibling}) => nextSibling!.textContent!.trim());

	save(forks);
}

function findForkedRepo(): string | undefined {
	const forkSourceElement = select<HTMLAnchorElement>('.fork-flag a');
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

	if (!forks) {
		return;
	}

	document.body.classList.add('rgh-forked-to');

	const forkCounter = select('.social-count[href$="/network/members"]')!;
	if (forks.length === 1) {
		forkCounter.before(
			<a href={`/${forks[0]}`}
				className="btn btn-sm float-left rgh-forked-button"
				title={`Open your fork to ${forks[0]}`}>
				{icons.externalLink()}
			</a>
		);
	} else {
		forkCounter.before(
			<details className="details-reset details-overlay select-menu float-left">
				<summary
					className="select-menu-button float-left btn btn-sm btn-with-count rgh-forked-button"
					title="Open any of your forks"/>
				<details-menu
					style={{zIndex: 99}}
					className="select-menu-modal position-absolute right-0 mt-5">
					<div className="select-menu-header">
						<span className="select-menu-title">Your forks</span>
					</div>
					{...forks.map(fork =>
						<a
							href={`/${fork}`}
							className="select-menu-item"
							title={`Open your fork to ${fork}`}>
							{icons.fork()}
							{fork}
						</a>
					)}
				</details-menu>
			</details>
		);
	}

	// Validate cache after showing links once, to make it faster
	await updateForks(forks);
}

features.add({
	id: __featureName__,
	description: 'Adds a shortcut to your forks next to the `Fork` button on the current repo.',
	screenshot: 'https://user-images.githubusercontent.com/55841/64077281-17bbf000-cccf-11e9-9123-092063f65357.png',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
