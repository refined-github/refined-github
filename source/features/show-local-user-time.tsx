/* eslint-disable no-await-in-loop */

import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import {clock} from '../libs/icons';
import * as api from '../libs/api';

interface Commit {
	url: string;
}

const timeFormatter = new Intl.DateTimeFormat('en-US', {
	hour: 'numeric',
	minute: 'numeric',
	hour12: false
});

async function loadLastCommit(pathname: string): Promise<Commit | void> {
	for await (const page of api.v3paginated(pathname)) {
		for (const event of page as any) { // eslint-disable-line @typescript-eslint/no-explicit-any
			if (event.type !== 'PushEvent') {
				continue;
			}

			// Start from the latest commit, which is the last one in the list
			for (const commit of event.payload.commits.reverse()) {
				const response = await api.v3(commit.url, {ignoreHTTPStatus: true});

				// `response.author` only appears if GitHub can match the email to a GitHub user
				if (response.author?.id === event.actor.id) {
					return commit;
				}
			}
		}
	}
}

async function getCommitPatch(commitUrl: string): Promise<string> {
	const {textContent} = await api.v3(commitUrl, {
		json: false,
		headers: {
			Accept: 'application/vnd.github.v3.patch'
		}
	});

	return textContent;
}

// IDEA: We could also return the date from the patch
// This could help to identify "wrong" offsets e.g. daylight saving
const loadTimezoneOffset = mem(async (login: string): Promise<number|undefined> => {
	const commit = await loadLastCommit(`users/${login}/events`);
	if (!commit) {
		return;
	}

	const patch = await getCommitPatch(commit.url);
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
		if (!login) {
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
