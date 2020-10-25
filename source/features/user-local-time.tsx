/* eslint-disable no-await-in-loop */

import React from 'dom-chef';
import cache from 'webext-storage-cache';
import delay from 'delay';
import select from 'select-dom';
import onetime from 'onetime';
import ClockIcon from 'octicon/clock.svg';

import features from '.';
import * as api from '../github-helpers/api';
import {getUsername} from '../github-helpers';
import observeElement from '../helpers/simplified-element-observer';

interface Commit {
	url: string;
	sha: string;
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
	hour: 'numeric',
	minute: 'numeric'
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

const getLastCommitDate = cache.function(async (login: string): Promise<string | false> => {
	for await (const page of api.v3paginated(`/users/${login}/events`)) {
		for (const event of page as any) {
			if (event.type !== 'PushEvent') {
				continue;
			}

			// Start from the latest commit, which is the last one in the list
			for (const commit of event.payload.commits.reverse() as Commit[]) {
				const response = await api.v3('/' + commit.url, {ignoreHTTPStatus: true});
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

				const patch = await loadCommitPatch('/' + commit.url);
				// The patch of merge commits doesn't include the commit sha so the date might be from another user
				if (patch.startsWith(`From ${commit.sha} `)) {
					return /^Date: (.*)$/m.exec(patch)?.[1] ?? false;
				}
			}
		}
	}

	return false;
}, {
	maxAge: {days: 10},
	staleWhileRevalidate: {days: 20},
	cacheKey: ([login]) => __filebasename + ':' + login
});

function parseOffset(date: string): number {
	const [, hourString, minuteString] = (/([-+]\d\d)(\d\d)$/).exec(date) ?? [];

	const hours = Number.parseInt(hourString, 10);
	const minutes = Number.parseInt(minuteString, 10);
	return (hours * 60) + (hours < 0 ? -minutes : minutes);
}

function init(): void {
	const hovercard = select('.js-hovercard-content > .Popover-message')!;

	observeElement(hovercard, async () => {
		if (
			select.exists('.rgh-local-user-time', hovercard) || // Time already added
			!select.exists('[data-hydro-view*="user-hovercard-hover"]', hovercard) // It's not the hovercard type we expect
		) {
			return;
		}

		const login = select<HTMLAnchorElement>('a[data-octo-dimensions="link_type:profile"]', hovercard)?.pathname.slice(1);
		if (!login || login === getUsername()) {
			return;
		}

		const datePromise = getLastCommitDate(login);
		const race = await Promise.race([delay(300), datePromise]);
		if (race === false) {
			// The timezone was undeterminable and this resolved "immediately" (or was cached), so don't add the icon at all
			return;
		}

		const placeholder = <span>Guessing local time…</span>;
		const container = (
			<div className="rgh-local-user-time mt-2 text-gray text-small">
				<ClockIcon/> {placeholder}
			</div>
		);

		// Adding the time element might change the height of the hovercard and thus break its positioning
		const hovercardHeight = hovercard.offsetHeight;

		select('div.d-flex.mt-3 > div.overflow-hidden.ml-3', hovercard)!.append(container);

		if (hovercard.matches('.Popover-message--bottom-right, .Popover-message--bottom-left')) {
			const diff = hovercard.offsetHeight - hovercardHeight;
			if (diff > 0) {
				const parent = hovercard.parentElement!;
				const top = Number.parseInt(parent.style.top, 10);
				parent.style.top = `${top - diff}px`;
			}
		}

		const date = await datePromise;
		if (!date) {
			placeholder.textContent = 'Timezone unknown';
			container.title = 'Timezone couldn’t be determined from their last commits';
			return;
		}

		const now = new Date();
		now.setMinutes(parseOffset(date) + now.getTimezoneOffset() + now.getMinutes());
		placeholder.textContent = timeFormatter.format(now);
		container.title = `Timezone guessed from their last commit: ${date}`;
	});
}

void features.add(__filebasename, {
	init: onetime(init)
});
