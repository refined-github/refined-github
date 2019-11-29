/* eslint-disable no-await-in-loop */

import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import cache from 'webext-storage-cache';
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

const parseOffset = (date: string): number => {
	const [, hourString, minuteString] = (/([-+]\d\d)(\d\d)$/).exec(date) ?? [];

	const hours = parseInt(hourString, 10);
	const minutes = parseInt(minuteString, 10);
	return (hours * 60) + (hours < 0 ? -minutes : minutes);
};

const loadLastCommitDate = mem(async (login: string): Promise<string | void> => {
	const patch = await loadLastCommitPatch(login);
	if (!patch) {
		return;
	}

	const [, date] = (/^Date: (.*)$/m).exec(patch) ?? [];
	return date;
});

const getLastCommit = mem(async (login: string): Promise<string | false> => {
	const key = `${__featureName__}:${login}`;

	const cached = await cache.get<string | false>(key);
	if (typeof cached !== 'undefined') {
		return cached;
	}

	const date = await loadLastCommitDate(login) || false;
	await cache.set(key, date, 10);
	return date;
});

function init(): void {
	const hovercard = select('.js-hovercard-content > .Popover-message')!;

	observeEl(hovercard, async () => {
		if (hovercard.childElementCount === 0 || select.exists('.rgh-local-user-time', hovercard)) {
			return;
		}

		const login = select<HTMLAnchorElement>('a[data-octo-dimensions="link_type:profile"]', hovercard)?.pathname.slice(1);
		if (!login || login === getUsername()) {
			return;
		}

		const placeholder = <span>Loading timezone…</span>;
		const container = <div className="rgh-local-user-time mt-2 text-gray text-small">
			{clock()} {placeholder}
		</div>;

		// Adding the time element might change the height of the hovercard and thus break its positioning
		const hovercardHeight = hovercard.offsetHeight;
		select('div.d-flex.mt-3 > div.overflow-hidden.ml-3', hovercard)!.append(container);

		if (hovercard.matches('.Popover-message--bottom-right, .Popover-message--bottom-left')) {
			const diff = hovercard.offsetHeight - hovercardHeight;
			if (diff > 0) {
				const parent = hovercard.parentElement!;
				const top = parseInt(parent.style.top, 10);
				parent.style.top = `${top - diff}px`;
			}
		}

		const date = await getLastCommit(login);
		if (!date) {
			placeholder.textContent = '-';
			container.title = 'No commit found';
			return;
		}

		const now = new Date();
		now.setMinutes(parseOffset(date) + now.getTimezoneOffset() + now.getMinutes());
		placeholder.textContent = timeFormatter.format(now);
		container.title = `Last commit found: ${date}`;
	});
}

features.add({
	id: __featureName__,
	description: 'Show the local time of a user in the hovercard (based on the last commit).',
	screenshot: false,
	load: features.onDomReady,
	init
});
