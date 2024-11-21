import React from 'react';
import elementReady from 'element-ready';
import LockIcon from 'octicons-plain-react/Lock';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {hasToken} from '../options-storage.js';
import api from '../github-helpers/api.js';
import GetIssueLockStatus from './locked-issue.gql';
import {getConversationNumber} from '../github-helpers/index.js';
import {isInitialLoad} from '../helpers/feature-helpers.js';

async function isConversationLockedViaApi(): Promise<boolean | undefined> {
	if (!hasToken()) {
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
	// Only use signals that clearly indicate the lock state
	// The form only appears to moderators
	const lockToggle = await elementReady('.discussion-sidebar-item svg.octicon-key + strong');
	return lockToggle ? lockToggle.textContent === 'Unlock conversation' : undefined;
}

async function isConversationLockedViaReactData(): Promise<boolean | undefined> {
	if (!isInitialLoad()) {
		return;
	}

	const data = await elementReady('[data-target="react-app.embeddedData"]');
	return data ? JSON.parse(data.textContent).payload?.preloadedQueries[0].result.data.repository?.issue?.locked : undefined;
}

async function isConversationLocked(): Promise<boolean | undefined> {
	// Like Promise.race, but it only resolves if the result is not undefined
	return new Promise(resolve => {
		// TODO: Add AbortSignal after https://github.com/sindresorhus/element-ready/issues/45
		const resolveIfDefined = async (check: () => Promise<boolean | undefined>): Promise<void> => {
			const result = await check();
			if (result !== undefined) {
				resolve(result);
			}
		};
		resolveIfDefined(isConversationLockedViaReactData);
		resolveIfDefined(isConversationLockedViaDom);
		resolveIfDefined(isConversationLockedViaApi);
	});
}

function LockedIndicator(): JSX.Element {
	return (
		<span title="Locked" className="State d-flex flex-items-center flex-shrink-0">
			<LockIcon className="flex-items-center mr-1" />
			Locked
		</span>
	);
}

function addLock(element: HTMLElement): void {
	const classes = (
		element.closest('.gh-header-sticky')
			? 'mr-2 '
			: ''
	)
	+ 'mb-2 rgh-locked-issue';
	element.after(
		<LockedIndicator className={classes} />,
	);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe([
		'.gh-header-meta > :first-child', // Issue title
		'.gh-header-sticky .flex-row > :first-child', // Sticky issue title
	], addLock, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isConversation,
		async () => await isConversationLocked() ?? false,
	],
	init,
});

/*

## Test URLs

- Locked issue: https://github.com/refined-github/sandbox/issues/74
- Locked PR: https://github.com/refined-github/sandbox/pull/48

*/
