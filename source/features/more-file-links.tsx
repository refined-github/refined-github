import React from 'dom-chef';
import {$} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';
import FileCodeIcon from 'octicons-plain-react/FileCode';
import VersionsIcon from 'octicons-plain-react/Versions';
import HistoryIcon from 'octicons-plain-react/History';

import features from '../feature-manager.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';

function getLegacyMenuItem(viewFile: HTMLAnchorElement, name: string, route: string): JSX.Element {
	const {href} = new GitHubFileURL(viewFile.href).assign({route});
	return (
		<a href={href} data-turbo={String(route !== 'raw')} className="pl-5 dropdown-item btn-link" role="menuitem">
			View {name}
		</a>
	);
}

function handleLegacyMenuOpening({delegateTarget: dropdown}: DelegateEvent): void {
	dropdown.classList.add('rgh-more-file-links'); // Mark this as processed

	const viewFile = $('a[data-ga-click^="View file"]', dropdown);
	viewFile.after(
		getLegacyMenuItem(viewFile, 'raw', 'raw'),
		getLegacyMenuItem(viewFile, 'blame', 'blame'),
		getLegacyMenuItem(viewFile, 'history', 'commits'),
		<div className="dropdown-divider" role="none" />,
	);
}

function getMenuItem(viewFile: HTMLElement, name: string, route: string, icon: React.JSX.Element): HTMLElement {
	const menuItem = viewFile.cloneNode(true);
	const fileLink = $('a', viewFile).href;
	const link = $('a', menuItem);
	link.href = new GitHubFileURL(fileLink).assign({route}).href;
	link.dataset.turbo = String(route !== 'raw');
	$('[class^="prc-ActionList-ItemLabel"]', menuItem).textContent = `View ${name}`;
	$('[class^="prc-ActionList-LeadingVisual"]', menuItem).replaceChildren(icon);
	return menuItem;
}

function handleMenuOpening(): void {
	const viewFile = $('[class^="prc-ActionList-ActionListItem"]:has(.octicon-eye)');
	viewFile.after(
		getMenuItem(viewFile, 'raw', 'raw', <FileCodeIcon />),
		getMenuItem(viewFile, 'blame', 'blame', <VersionsIcon />),
		getMenuItem(viewFile, 'history', 'commits', <HistoryIcon />),
		viewFile.nextElementSibling?.getAttribute('data-component') === 'ActionList.Divider'
			? ''
			: <li className="dropdown-divider" aria-hidden="true" data-component="ActionList.Divider" />,
	);
}

function init(signal: AbortSignal): void {
	// `capture: true` required to be fired before GitHub's handlers
	delegate('.file-header .js-file-header-dropdown:not(.rgh-more-file-links)', 'toggle', handleLegacyMenuOpening, {capture: true, signal});
	delegate('[class^="DiffFileHeader-module__diff-file-header"] button:has(>.octicon-kebab-horizontal)', 'click', handleMenuOpening);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasFiles,
	],
	init,
});

/*

Test URLs:
https://github.com/refined-github/sandbox/pull/55/files
https://github.com/refined-github/sandbox/compare/41c25160f0f574b302d72652ac83f4b2dab47e19...770d2ad5f086371da8a5f078f4267e6847e649f5
https://github.com/refined-github/sandbox/commit/0504e7dccb40374c24c1217f37d3579993d6071e

*/
