import React from 'dom-chef';
import {$} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';
import HistoryIcon from 'octicons-plain-react/History';
import FileCodeIcon from 'octicons-plain-react/FileCode';
import GitBranchIcon from 'octicons-plain-react/GitBranch';

import features from '../feature-manager.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';

function handleMenuOpening({delegateTarget: dropdown}: DelegateEvent): void {
	dropdown.classList.add('rgh-more-file-links'); // Mark this as processed

	const viewFile = $('a[data-ga-click^="View file"]', dropdown);
	const getDropdownLink = (name: string, route: string): JSX.Element => {
		const {href} = new GitHubFileURL(viewFile.href).assign({route});
		return (
			<a href={href} data-turbo={String(route !== 'raw')} className="pl-5 dropdown-item btn-link" role="menuitem">
				View {name}
			</a>
		);
	};

	viewFile.after(
		getDropdownLink('raw', 'raw'),
		getDropdownLink('blame', 'blame'),
		getDropdownLink('history', 'commits'),
		<div className="dropdown-divider" role="none" />,
	);
}

function handleMenuOpeningReact(): void {
	const viewFile = $('[class^="prc-ActionList-ActionListItem"]:has(.octicon-eye)');
	const fileLink = $('a', viewFile).href;

	const getMenuItem = (name: string, route: string, icon?: React.JSX.Element): HTMLElement => {
		const menuItem = viewFile.cloneNode(true);
		const link = $('a', menuItem);
		link.href = new GitHubFileURL(fileLink).assign({route}).href;
		link.dataset.turbo = String(route !== 'raw');
		$('[class^="prc-ActionList-ItemLabel"]', menuItem).textContent = `View ${name}`;
		$('[class^="prc-ActionList-LeadingVisual"]', menuItem).replaceChildren(icon ?? '');
		return menuItem;
	};

	viewFile.after(
		getMenuItem('raw', 'raw', <FileCodeIcon />),
		getMenuItem('blame', 'blame', <GitBranchIcon />),
		getMenuItem('history', 'commits', <HistoryIcon />),
		viewFile.nextElementSibling?.getAttribute('data-component') === 'ActionList.Divider'
			? ''
			: <li className="dropdown-divider" aria-hidden="true" data-component="ActionList.Divider" />,
	);
}

function init(signal: AbortSignal): void {
	// `capture: true` required to be fired before GitHub's handlers
	delegate('.file-header .js-file-header-dropdown:not(.rgh-more-file-links)', 'toggle', handleMenuOpening, {capture: true, signal});
	delegate('[class^="DiffFileHeader-module__diff-file-header"] button:has(>.octicon-kebab-horizontal)', 'click', handleMenuOpeningReact);
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
