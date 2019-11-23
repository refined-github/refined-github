/* eslint-disable no-await-in-loop */

import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import optionsStorage from '../options-storage';
import observeEl from '../libs/simplified-element-observer';
import {clock} from '../libs/icons';

interface Commit {
	url: string;
}

interface Event {
	type: string;
	payload: {
		commits: Commit[];
	};
	actor: {
		id: number;
	};
}

// NOTE: This is basically copied from api.v3() but we can't use it because
// it always parses the res as json it also can't handle absolute urls yet.
// TODO: Add this to lib/api somehow
const settings = optionsStorage.getAll();
const api3 = location.hostname === 'github.com' ?
	'https://api.github.com/' :
	`${location.origin}/api/v3/`;
const api = async (query: string, options: RequestInit = {}): Promise<Response> => {
	const {personalToken} = await settings;

	const url = query.startsWith('http') ? query : (api3 + query);
	const headers = {
		'User-Agent': 'Refined GitHub',
		Accept: 'application/vnd.github.v3+json',
		...options.headers,
		...(personalToken ? {Authorization: `token ${personalToken}`} : {})
	};

	return fetch(url, {
		...options,
		headers
	});
};

async function loadLastCommit(url: string): Promise<Commit|undefined> {
	const response = await api(url);
	if (!response.ok) {
		return;
	}

	// NOTE: We iterate in series here to reduce requests
	// The first commit should already work in most cases
	const events = await response.json() as Event[];
	for (const event of events) {
		if (event.type !== 'PushEvent') {
			continue;
		}

		// NOTE: We want to iterate the commits in reverse to start with the latest commitjust
		for (const commit of event.payload.commits.reverse()) {
			const response = await api(commit.url);
			if (!response.ok) {
				// NOTE: Ignore 404 errors and check the next commit
				if (response.status === 404) {
					continue;
				}

				return;
			}

			const {author} = await response.json();
			// NOTE: Some commits don't have an author when there is no github user for the autor email.
			if (author?.id === event.actor.id) {
				return commit;
			}
		}
	}

	const [, next] = /<([^>]+)>; rel="next"/.exec(response.headers.get('link')!) ?? [];
	if (!next) {
		return;
	}

	return loadLastCommit(next);
}

async function getCommitPatch(commit: Commit): Promise<string> {
	const response = await api(commit.url, {
		headers: {
			Accept: 'application/vnd.github.v3.patch'
		}
	});

	return response.ok ? response.text() : '';
}

// IDEA: We could also return the date from the patch
// This could help to identify "wrong" offsets e.g. daylight saving
const loadTimezoneOffset = mem(async (login: string): Promise<number|undefined> => {
	const commit = await loadLastCommit(`users/${login}/events`);
	if (!commit) {
		return;
	}

	const patch = await getCommitPatch(commit);
	const [, hourString, minuteString] = (/^Date: .* ([-+]\d\d)(\d\d)$/m).exec(patch) ?? [];

	const hours = parseInt(hourString, 10);
	const minutes = parseInt(minuteString, 10);
	return (hours * 60) + (hours < 0 ? -minutes : minutes);
});

const format = (number: number): string => number.toString().padStart(2, '0');

function init(): void {
	const container = select('.js-hovercard-content > .Popover-message')!;

	observeEl(container, async () => {
		if (container.childElementCount === 0 || select.exists('.rgh-local-user-time')) {
			return;
		}

		const profile = select<HTMLAnchorElement>('a[data-octo-dimensions="link_type:profile"]', container);
		if (!profile) {
			return;
		}

		// NOTE: Adding the time element might changes the height of the hovercard and thuse break the positioning.
		// So we store the container height and adjust the positioning if needed after adding the placeholder.
		const containerHeight = container.offsetHeight;
		const classNames = ['Popover-message--bottom-right', 'Popover-message--bottom-left'];
		const needsAdjustment = classNames.some(name => container.classList.contains(name));

		const placeholder = <span>Loading…</span>;

		select('div.d-flex.mt-3 > div.overflow-hidden.ml-3', container)!.append(
			<div className="rgh-local-user-time mt-2 text-gray text-small">
				{clock()} {placeholder}
			</div>
		);

		if (needsAdjustment) {
			const diff = container.offsetHeight - containerHeight;
			if (diff > 0) {
				const parent = container.parentElement!;
				const top = parseInt(parent.style.top ?? '0', 10);
				parent.style.top = `${top - diff}px`;
			}
		}

		const login = profile.pathname.replace(/^\//, '');
		const offset = await loadTimezoneOffset(login);
		if (!Number.isFinite(offset!)) {
			placeholder.textContent = '-';
			return;
		}

		const date = new Date();
		date.setMinutes(offset! + date.getTimezoneOffset() + date.getMinutes());
		placeholder.textContent = `${format(date.getHours())}:${format(date.getMinutes())}`;
	});
}

features.add({
	id: __featureName__,
	description: 'Show the local time of a user in the hovercard (based on the last commit).',
	screenshot: false,
	load: features.onDomReady,
	init
});
