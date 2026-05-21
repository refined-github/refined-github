import './extensible-nav.css';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import React from 'react';
import {$, $$, $optional} from 'select-dom';
import {assertPresent} from 'ts-extras';

import AgentIcon from 'octicons-plain-react/Agent';
import BookIcon from 'octicons-plain-react/Book';
import CodeIcon from 'octicons-plain-react/Code';
import GearIcon from 'octicons-plain-react/Gear';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import GraphIcon from 'octicons-plain-react/Graph';
import IssueOpenedIcon from 'octicons-plain-react/IssueOpened';
import PlayIcon from 'octicons-plain-react/Play';
import ShieldIcon from 'octicons-plain-react/Shield';

import features from '../feature-manager.js';
import onetime from '../helpers/onetime.js';

let ready = false;

const knownTabsIcons = new Map([
	['code', CodeIcon],
	['issues', IssueOpenedIcon],
	['pull-requests', GitPullRequestIcon],
	['agents', AgentIcon],
	['actions', PlayIcon],
	['wiki', BookIcon],
	['security-and-quality', ShieldIcon],
	['insights', GraphIcon],
	['settings', GearIcon],
]);

function generateTab(item: HTMLAnchorElement): JSX.Element {
	const label = ($optional('[data-component="text"]', item) ?? item).textContent;
	// Only a few items have counters
	const counter = $optional('[data-component="counter"] [data-variant="secondary"]', item)?.textContent;
	const selectedClass = item.hasAttribute('aria-current') ? 'selected' : '';

	// Hard assertions will make the feature fail before it attempts to replace the native one.
	// Being the repository's main navigation, we want to avoid breaking.
	const itemId = item.getAttribute('data-tab-item');
	assertPresent(itemId);
	const Icon = knownTabsIcons.get(itemId);
	assertPresent(Icon);

	// `UnderlineNav-octicon` comes after d-none utility classes so they can't override it
	const icon = <Icon className="UnderlineNav-octicon" />;

	return (
		<li key={item.href}>
			<a href={item.href} className={'UnderlineNav-item ' + selectedClass}>
				{icon}
				{label}
				{counter && (
					<span className="Counter">{counter}</span>
				)}
			</a>
		</li>
	);
}

async function initOnce(): Promise<void> {
	const nativeNav = (await elementReady('nav[aria-label="Repository"]'))!;
	const items = $$('a', nativeNav);
	nativeNav.before(
		<nav className="UnderlineNav rgh-extensible-nav px-4">
			<ul className="UnderlineNav-body">
				{items.map(item => generateTab(item))}
			</ul>
		</nav>,
	);

	nativeNav.classList.add('sr-only');
	ready = true;
}

function updateCurrentTab(): void {
	const currentTab = $('nav[aria-label="Repository"] a[aria-current]');
	$('.rgh-extensible-nav .selected').classList.remove('selected');
	$(`.rgh-extensible-nav a[href="${currentTab.href}"]`).classList.add('selected');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	init: onetime(initOnce),
}, {
	asLongAs: [
		() => ready,
	],
	include: [
		pageDetect.isRepo,
	],
	init: updateCurrentTab,
});

/*

Test URLs:

https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/pulse

*/
