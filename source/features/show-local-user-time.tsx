/* eslint-disable no-await-in-loop */

import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import {clock} from '../libs/icons';
import * as api from '../libs/api';
import {getUsername} from '../libs/utils';

const timeFormatter = new Intl.DateTimeFormat('en-US', {
	hour: 'numeric',
	minute: 'numeric',
	hour12: false
});

async function loadCommitPatch(commitUrl: string): Promise<string> {
	const {textContent} = await api.v3(commitUrl, {
		json: false,
		headers: {
			Accept: 'application/vnd.github.v3.patch'
		}
	});

	return textContent;
}

async function loadLastCommitPatch(login: string): Promise<string | void> {
	for await (const page of api.v3paginated(`users/${login}/events`)) {
		for (const event of page as any) { // eslint-disable-line @typescript-eslint/no-explicit-any
			if (event.type !== 'PushEvent') {
				continue;
			}

			// Start from the latest commit, which is the last one in the list
			for (const commit of event.payload.commits.reverse()) {
				const response = await api.v3(commit.url, {ignoreHTTPStatus: true});

				// Commits might not exist anymore even if they are listed in the events
				// This can happen if the repository was deleted so we can also skip all other commits
				if (response.httpStatus === 404) {
					break;
				}

				if (!response.ok) {
					throw await api.getError(response);
				}

				// `response.author` only appears if GitHub can match the email to a GitHub user
				if (response.author?.id !== event.actor.id) {
					continue;
				}

				const patch = await loadCommitPatch(commit.url);
				// The patch of merge commits doesn't include the commit sha so the date might be from another user
				if (patch.startsWith(`From ${commit.sha} `)) {
					return patch;
				}
			}
		}
	}
}

// IDEA: We could also return the date from the patch
// This could help to identify "wrong" offsets e.g. daylight saving
const loadTimezoneOffset = mem(async (login: string): Promise<number | void> => {
	const patch = await loadLastCommitPatch(login);
	if (!patch) {
		return;
	}

	const [, hourString, minuteString] = (/^Date: .* ([-+]\d\d)(\d\d)$/m).exec(patch) ?? [];

	const hours = parseInt(hourString, 10);
	const minutes = parseInt(minuteString, 10);
	return (hours * 60) + (hours < 0 ? -minutes : minutes);
});

function init(): void {
	const container = select('.js-hovercard-content > .Popover-message')!;

	observeEl(container, async () => {
		if (container.childElementCount === 0 || select.exists('.rgh-local-user-time')) {
			return;
		}

		const login = select<HTMLAnchorElement>('a[data-octo-dimensions="link_type:profile"]', container)?.pathname.slice(1);
		if (!login || login === getUsername()) {
			return;
		}

		// Adding the time element might change the height of the hovercard and thus break its positioning
		const containerHeight = container.offsetHeight;

		const placeholder = <span>Loading timezone…</span>;

		select('div.d-flex.mt-3 > div.overflow-hidden.ml-3', container)!.append(
			<div className="rgh-local-user-time mt-2 text-gray text-small">
				{clock()} {placeholder}
			</div>
		);

		if (container.matches('.Popover-message--bottom-right, .Popover-message--bottom-left')) {
			const diff = container.offsetHeight - containerHeight;
			if (diff > 0) {
				const parent = container.parentElement!;
				const top = parseInt(parent.style.top, 10);
				parent.style.top = `${top - diff}px`;
			}
		}

		const offset = await loadTimezoneOffset(login);
		if (typeof offset === 'undefined') {
			placeholder.textContent = '-';
			return;
		}

		const date = new Date();
		date.setMinutes(offset + date.getTimezoneOffset() + date.getMinutes());
		placeholder.textContent = timeFormatter.format(date);
	});
}

features.add({
	id: __featureName__,
	description: 'Show the local time of a user in the hovercard (based on the last commit).',
	screenshot: false,
	load: features.onDomReady,
	init
});
