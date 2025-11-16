import elementReady from 'element-ready';

import {isInitialLoad} from '../helpers/feature-helpers.js';
import {hasToken} from '../options-storage.js';
import api from '../github-helpers/api.js';
import GetIssueLockStatus from './is-conversation-locked.gql';
import {getConversationNumber} from '../github-helpers/index.js';

async function isConversationLockedViaApi(): Promise<boolean | undefined> {
	if (!await hasToken()) {
		return undefined;
	}

	const {repository} = await api.v4uncached(GetIssueLockStatus, {
		variables: {
			number: getConversationNumber()!,
		},
	});

	return repository.issueOrPullRequest.locked;
}

async function isConversationLockedViaDom(): Promise<boolean | undefined> {
	// The form only appears to moderators
	const lockToggle = await elementReady([
		'.discussion-sidebar-item svg.octicon-key + strong', // PRs, old issues
		'[class^="Item__LiBox"]:has(svg.octicon-lock) [data-component="ActionList.Item--DividerContainer"] span', // Issues
	].join(', '));
	return lockToggle ? lockToggle.textContent === 'Unlock conversation' : undefined;
}

async function isConversationLockedViaReactData(): Promise<boolean | undefined> {
	if (!isInitialLoad()) {
		return;
	}

	const data = await elementReady('[data-target="react-app.embeddedData"]');
	return data ? JSON.parse(data.textContent).payload?.preloadedQueries[0].result.data.repository?.issue?.locked : undefined;
}

export default async function isConversationLocked(): Promise<boolean | undefined> {
	// Like Promise.race, but it only resolves if the result is not undefined
	return new Promise(resolve => {
		// TODO: Add AbortSignal after https://github.com/sindresorhus/element-ready/issues/45
		const resolveIfDefined = async (check: () => Promise<boolean | undefined>): Promise<void> => {
			const result = await check();
			if (result !== undefined) {
				resolve(result);
			}
		};

		void resolveIfDefined(isConversationLockedViaReactData);
		void resolveIfDefined(isConversationLockedViaDom);
		void resolveIfDefined(isConversationLockedViaApi);
	});
}
