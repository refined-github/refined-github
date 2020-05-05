import './forked-to.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import ForkIcon from 'octicon/repo-forked.svg';
import CheckIcon from 'octicon/check.svg';
import elementReady from 'element-ready';
import LinkExternalIcon from 'octicon/link-external.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import fetchDom from '../libs/fetch-dom';
import {isForkedRepo} from 'github-page-detection';
import {getRepoURL, getUsername, getForkedRepo} from '../libs/utils';

const getForkSourceRepo = (): string => getForkedRepo() ?? getRepoURL();
const getCacheKey = (): string => `forked-to:${getUsername()}@${getForkSourceRepo().toLowerCase()}`;

const updateCache = cache.function(async (): Promise<string[] | undefined> => {
	const document = await fetchDom(`/${getForkSourceRepo()}/fork?fragment=1`);
	const forks = select
		.all('.octicon-repo-forked', document)
		.map(({nextSibling}) => nextSibling!.textContent!.trim().toLowerCase());

	return forks.length > 0 ? forks : undefined;
}, {
	cacheKey: getCacheKey,
	maxAge: 1 / 24,
	staleWhileRevalidate: 5
});

async function updateUI(forks: string[]): Promise<void> {
	// Don't add button if you're visiting the only fork available
	if (forks.length === 1 && forks[0] === getRepoURL()) {
		return;
	}

	document.body.classList.add('rgh-forked-to');
	const forkCounter = (await elementReady('.social-count[href$="/network/members"]'))!;
	if (forks.length === 1) {
		forkCounter.before(
			<a
				href={`/${forks[0]}`}
				className="btn btn-sm float-left rgh-forked-button"
				title={`Open your fork at ${forks[0]}`}
			>
				<LinkExternalIcon/>
			</a>
		);
	} else {
		forkCounter.before(
			<details className="details-reset details-overlay select-menu float-left">
				<summary
					className="select-menu-button float-left btn btn-sm btn-with-count rgh-forked-button"
					aria-haspopup="menu"
					title="Open any of your forks"/>
				<details-menu
					style={{zIndex: 99}}
					className="select-menu-modal position-absolute right-0 mt-5"
				>
					<div className="select-menu-header">
						<span className="select-menu-title">Your forks</span>
					</div>
					{forks.map(fork => (
						<a
							href={`/${fork}`}
							className={`select-menu-item ${fork === getRepoURL() ? 'selected' : ''}`}
							title={`Open your fork at ${fork}`}
						>
							<span className="select-menu-item-icon rgh-forked-to-icon">
								{fork === getRepoURL() ? <CheckIcon/> : <ForkIcon/>}
							</span>
							{fork}
						</a>
					))}
				</details-menu>
			</details>
		);
	}
}

async function init(): Promise<void | false> {
	const forks = await cache.get<string[]>(getCacheKey());
	if (forks) {
		await updateUI(forks);
	}

	// This feature only applies to users that have multiple organizations, because that makes a fork picker modal appear when clicking on "Fork"
	const hasOrganizations = await elementReady('details-dialog[src*="/fork"] include-fragment');

	// Only fetch/update forks when we see a fork (on the current page or in the cache).
	// This avoids having to `updateCache` for every single repo you visit.
	if (forks || (hasOrganizations && isForkedRepo())) {
		await updateCache();
	} else {
		return false;
	}
}

features.add({
	id: __filebasename,
	description: 'Adds a shortcut to your forks next to the `Fork` button on the current repo.',
	screenshot: 'https://user-images.githubusercontent.com/55841/64077281-17bbf000-cccf-11e9-9123-092063f65357.png'
}, {
	include: [
		pageDetect.isRepo
	],
	waitForDomReady: false,
	init
});
