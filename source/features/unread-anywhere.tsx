import {$} from 'select-dom/strict.js';
import {messageRuntime} from 'webext-msg';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ArrowUpRightIcon from 'octicons-plain-react/ArrowUpRight';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import onetime from '../helpers/onetime.js';
import showToast from '../github-helpers/toast.js';
import pluralize from '../helpers/pluralize.js';
import observe from '../helpers/selector-observer';
import {getClasses, isSmallDevice} from '../helpers/dom-utils';
import {expectToken} from '../github-helpers/github-token.js';
import type {OpenResponse} from './unread-anywhere.background.js';

async function openUnreadNotifications(event?: React.MouseEvent): Promise<void> {
	if (event?.target instanceof HTMLButtonElement) {
		// Hide the tooltip
		event.target.blur();
		event.target.disabled = true; // Prevent multiple clicks
	}

	await showToast(async updateToast => {
		const {opened, remaining} = await messageRuntime<OpenResponse>({
			openUnreadNotifications: true,
		});

		if (opened === 0) {
			updateToast('No unread notifications');
			return;
		}

		if (remaining) {
			updateToast(`Opened the last ${opened} unread notifications`);
		} else {
			updateToast(pluralize(opened, '$$ notification') + ' opened');
			// Update the UI too
			$('.AppHeader-button--hasIndicator').classList.remove('AppHeader-button--hasIndicator');
		}
	}, {
		message: 'Loading notifications…',
		doneMessage: false,
	}).finally(() => {
		if (event?.target instanceof HTMLButtonElement) {
			event.target.disabled = false;
		}
	});
}

function addButton(nativeLink: HTMLAnchorElement): void {
	const classes = getClasses(nativeLink);
	classes.delete('AppHeader-button--hasIndicator');
	// Reverse order so that the new button is painted below the "unread indicator"
	nativeLink.parentElement!.classList.add('d-flex', 'flex-row-reverse');
	nativeLink.classList.add('AppHeader-buttonLeft');
	const button = (
		<button
			type="button"
			onClick={openUnreadNotifications}
			// Show pointer cursor even when disabled
			style={{width: 10, cursor: 'pointer'}}

			// JSX swallows \n if you skip {''}
			aria-label={'Open unread notifications\nHotkey: g u'}
		>
			<ArrowUpRightIcon className="mb-2" />
		</button>
	);
	nativeLink.before(button);
	button.classList.add(
		...classes,
		'AppHeader-buttonRight',
		'tooltipped',
		'tooltipped-sw',
	);
}

// No signal, created once per load
async function initOnce(): Promise<void> {
	await expectToken();
	registerHotkey('g u', openUnreadNotifications);
	document.documentElement.classList.add('rgh-unread-anywhere');
	observe('a#AppHeader-notifications-button.AppHeader-button--hasIndicator', addButton);
}

void features.add(import.meta.url, {
	shortcuts: {
		'g u': 'Open all unread notifications from anywhere',
	},
	exclude: [
		// Disable the feature entirely on small screens
		isSmallDevice,

		// Can't work on gists due to CORS: https://github.com/refined-github/refined-github/issues/8641
		pageDetect.isGist,
	],
	init: onetime(initOnce),
});

/*

Test URLs: anywhere :)

*/
