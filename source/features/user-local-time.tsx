/* eslint-disable no-await-in-loop */

import './user-local-time.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import delay from 'delay';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import {ClockIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getUsername, getCleanPathname} from '../github-helpers';

type Commit = {
	url: string;
	sha: string;
};

async function loadCommitPatch(commitUrl: string): Promise<string> {
	const {textContent} = await api.v3(commitUrl, {
		json: false,
		headers: {
			Accept: 'application/vnd.github.v3.patch',
		},
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
					return /^Date: (.*)$/m.exec(patch)?.[1] ?? false;
				}
			}
		}
	}

	return false;
}, {
	maxAge: {days: 10},
	staleWhileRevalidate: {days: 20},
	cacheKey: ([login]) => 'last-commit:' + login,
});

function parseOffset(date: string): number {
	const [, hourString, minuteString] = (/([-+]\d\d)(\d\d)$/).exec(date) ?? [];

	const hours = Number.parseInt(hourString, 10);
	const minutes = Number.parseInt(minuteString, 10);
	return (hours * 60) + (hours < 0 ? -minutes : minutes);
}

async function display({
	datePromise,
	placeholder,
	container,
}: {
	datePromise: Promise<string | false>;
	placeholder: JSX.Element;
	container: JSX.Element;
}): Promise<void> {
	const date = await datePromise;
	if (!date) {
		placeholder.textContent = 'Timezone unknown';
		container.title = 'Timezone couldn’t be determined from their last commits';
		return;
	}

	const userTime = new Date();
	userTime.setMinutes(parseOffset(date) + userTime.getTimezoneOffset() + userTime.getMinutes());

	const timeFormatter = new Intl.DateTimeFormat(undefined, {
		hour: 'numeric',
		minute: 'numeric',
		weekday: userTime.getDay() === new Date().getDay() ? undefined : 'long',
	});

	placeholder.textContent = timeFormatter.format(userTime);
	container.title = `Timezone guessed from their last commit: ${date}`;
}

async function insertUserLocalTime(hovercardContainer: Element): Promise<void> {
	const hovercard = hovercardContainer.closest('div.Popover-message')!;
	if (!select.exists('[data-hydro-view*="user-hovercard-hover"]', hovercard)) {
		// It's not the hovercard type we expect
		return;
	}

	const login = select('a.Link--primary', hovercard)?.pathname.slice(1);
	if (!login || login === getUsername()) {
		return;
	}

	hovercardContainer.classList.add('rgh-user-local-time');

	const datePromise = getLastCommitDate(login);
	const race = await Promise.race([delay(300), datePromise]);
	if (race === false) {
		// The timezone was undeterminable and this resolved "immediately" (or was cached), so don't add the icon at all
		return;
	}

	const placeholder = <span className="ml-1">Guessing local time…</span>;
	const container = (
		<div className="mt-2 color-fg-muted text-small d-flex">
			<ClockIcon/> {placeholder}
		</div>
	);

	// Adding the time element might change the height of the hovercard and thus break its positioning
	const hovercardHeight = hovercard.offsetHeight;

	// Only remove the space reserved via CSS when the element is actually inserted in the hovercard #4527
	hovercardContainer.classList.add('rgh-user-local-time-added');
	hovercardContainer.append(container);

	if (hovercard.matches('.Popover-message--bottom-right, .Popover-message--bottom-left')) {
		const diff = hovercard.offsetHeight - hovercardHeight;
		if (diff > 0) {
			const parent = hovercard.parentElement!;
			const top = Number.parseInt(parent.style.top, 10);
			parent.style.top = `${top - diff}px`;
		}
	}

	void display({datePromise, placeholder, container});
}

const selector = [
	'.js-hovercard-content .Popover-message div.d-flex.mt-3.overflow-hidden > div.d-flex:not(.rgh-user-local-time)',
	'.js-hovercard-content .Popover-message div.d-flex.mt-3 > div.overflow-hidden.ml-3:not(.rgh-user-local-time)', // GHE 2022/06/24
].join(',');
function init(): void {
	observe(selector, {
		add: insertUserLocalTime,
	});
}

async function profileInit(): Promise<void> {
	const login = getCleanPathname();
	if (login === getUsername()) {
		return;
	}

	const datePromise = getLastCommitDate(login);
	const race = await Promise.race([delay(300), datePromise]);
	if (race === false) {
		// The timezone was undeterminable and this resolved "immediately" (or was cached), so don't add the icon at all
		return;
	}

	const placeholder = <span className="v-align-middle">Guessing local time…</span>;
	const container = (
		<li className="vcard-detail pt-1 css-truncate css-truncate-target">
			<ClockIcon/> {placeholder}
		</li>
	);

	select('.vcard-details')!.append(container);

	void display({datePromise, placeholder, container});
}

void features.add(import.meta.url, {
	init: onetime(init),
}, {
	include: [
		pageDetect.isUserProfile,
	],
	exclude: [
		pageDetect.isPrivateUserProfile,
	],
	init: profileInit,
});
