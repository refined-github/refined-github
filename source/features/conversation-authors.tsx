import './conversation-authors.css';

import * as pageDetect from 'github-url-detection';
import {CachedFunction} from 'webext-storage-cache';
import {assertError} from 'ts-extras';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo, getLoggedInUser} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import GetCollaborators from './conversation-authors.gql';

const collaborators = new CachedFunction('repo-collaborators', {
	async updater(): Promise<string[]> {
		try {
			const {repository} = await api.v4(GetCollaborators);
			return repository.collaborators.nodes.map((user: Record<string, string>) => user.login);
		} catch (error) {
			assertError(error);
			if (error.message.includes('You do not have permission to view repository collaborators')) {
				return [];
			}

			throw error;
		}
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: cacheByRepo,
});

async function highlightCollaborators(signal: AbortSignal): Promise<void> {
	const list = await collaborators.get();
	observe('a[class^="IssueItem-module__authorCreatedLink"]', author => {
		const name = author.textContent.trim();
		if (list.includes(name) && name !== getLoggedInUser()) {
			author.classList.add('rgh-collaborator');
		}
	}, {signal});
}

function highlightSelf(signal: AbortSignal): void {
	// "Opened by {user}" and "Created by {user}"
	observe([
		// TODO [2027-01-01]: Drop after the legacy PR Files view is gone
		`.opened-by a[title$="ed by ${CSS.escape(getLoggedInUser()!)}"]`,
		`a[class^="IssueItem-module__authorCreatedLink"][data-hovercard-url="/users/${
			CSS.escape(getLoggedInUser()!)
		}/hovercard"]`,
	], author => {
		author.classList.add('rgh-own-conversation');
	}, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueList,
	],
	requiresToken: true,
	init: highlightCollaborators,
}, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	init: highlightSelf,
});

/*

Test URLs:

https://github.com/issues
https://github.com/refined-github/refined-github/issues

*/
