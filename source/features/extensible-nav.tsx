import './extensible-nav.css';

import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$, $$, $optional} from 'select-dom';
import {assertPresent} from 'ts-extras';
import {mount} from 'svelte';

import AgentIcon from 'octicons-plain-react/Agent';
import BookIcon from 'octicons-plain-react/Book';
import CodeIcon from 'octicons-plain-react/Code';
import CommentDiscussionIcon from 'octicons-plain-react/CommentDiscussion';
import GearIcon from 'octicons-plain-react/Gear';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import GraphIcon from 'octicons-plain-react/Graph';
import IssueOpenedIcon from 'octicons-plain-react/IssueOpened';
import PlayIcon from 'octicons-plain-react/Play';
import ShieldIcon from 'octicons-plain-react/Shield';
import TableIcon from 'octicons-plain-react/Table';

import features from '../feature-manager.js';
import {selectTab, setNativeTabs, type Tab} from '../helpers/extensible-nav-store.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';
import ExtensibleNav from './extensible-nav.svelte';

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
	['discussions', CommentDiscussionIcon],
	['projects', TableIcon],
]);

function generateTab(item: HTMLAnchorElement): Tab {
	const label = ($optional('[data-component="text"]', item) ?? item).textContent;
	// Only a few items have counters
	const counter = $optional('[data-component="counter"] [data-variant="secondary"]', item)?.textContent;

	// Hard assertions will make the feature fail before it attempts to replace the native one.
	// Being the repository's main navigation, we want to avoid breaking.
	const itemId = item.getAttribute('data-tab-item');
	assertPresent(itemId);
	const icon = knownTabsIcons.get(itemId);
	assertPresent(icon);

	return {
		id: itemId,
		href: item.href,
		label,
		icon,
		counter,
	};
}

function replace(nativeNav: HTMLElement): void {
	const items = $$('a', nativeNav);

	// Shouldn't be missing, but assert anyway
	const current = items
		.find(item => item.hasAttribute('aria-current'))
		?.getAttribute('data-tab-item');
	assertPresent(current);

	setNativeTabs(items.map(item => generateTab(item)));
	selectTab(current);

	mount(ExtensibleNav, {target: nativeNav.parentElement!});

	nativeNav.classList.add('rgh-extensible-nav-removed');
}

async function initOnce(): Promise<void> {
	// Use `element-ready` to ensure that the native navigation is fully loaded before replacing it for the first time.
	await elementReady('.loaded nav[aria-label="Repository"]');

	// Use `observe` because GitHub occasionally removes and re-adds the entire header.
	observe('.loaded nav[aria-label="Repository"]', replace);
}

function updateCurrentTab(): void {
	const currentTab = $('nav[aria-label="Repository"] a[aria-current][data-tab-item]');
	const itemId = currentTab.getAttribute('data-tab-item')!;
	selectTab(itemId);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	init: onetime(initOnce),
}, {
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
