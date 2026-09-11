import './conversation-authors.css';

import * as pageDetect from 'github-url-detection';
import {CachedFunction} from 'webext-storage-cache';
import {assertError} from 'ts-extras';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo, getLoggedInUser} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {listAuthorSelector} from '../github-helpers/selectors.js';
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
	// Public repository lists can be viewed while logged out.
	const self = getLoggedInUser()?.toLowerCase();
	observe<string, HTMLElement>(listAuthorSelector, author => {
		const update = (): void => {
			// Direct text excludes hidden accessibility spans and injected avatars/names.
			const hovercard = author.getAttribute('data-hovercard-url');
			const name = hovercard
				// Malformed or non-user hovercard.
				? /^\/users\/(?<login>[^/]+)\/hovercard$/.exec(hovercard)?.groups?.login ?? ''
				: [...author.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join('').trim();
			// Preserve the legacy title-based selector, including nested author text.
			// "Opened by {user}" and "Created by {user}"
			// TODO [2027-01-01]: Drop after the legacy PR Files view is gone
			const ownLegacyAuthor = Boolean(self && author.matches(`.opened-by a[title$="ed by ${CSS.escape(self)}" i]`));
			author.classList.toggle('rgh-own-conversation', Boolean(ownLegacyAuthor || (self && name.toLowerCase() === self)));
		};

		update();
		const observer = new MutationObserver(update);
		observer.observe(author, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ['data-hovercard-url', 'title'],
		});
		signal.addEventListener('abort', () => {
			observer.disconnect();
		}, {once: true});
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
