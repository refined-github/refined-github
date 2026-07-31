import './extensible-nav.css';

import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$$, $optional, elementExists} from 'select-dom';
import {assertPresent} from 'ts-extras';
import {mount} from 'svelte';
import {readable} from 'svelte/store';

import AiModel from 'octicons-plain-react/AiModel';
import AgentIcon from 'octicons-plain-react/Agent';
import BookIcon from 'octicons-plain-react/Book';
import CodeIcon from 'octicons-plain-react/Code';
import CommentDiscussionIcon from 'octicons-plain-react/CommentDiscussion';
import GearIcon from 'octicons-plain-react/Gear';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import GitPullRequestLockedIcon from 'octicons-plain-react/GitPullRequestLocked';
import GraphIcon from 'octicons-plain-react/Graph';
import IssueOpenedIcon from 'octicons-plain-react/IssueOpened';
import PlayIcon from 'octicons-plain-react/Play';
import ShieldIcon from 'octicons-plain-react/Shield';
import TableIcon from 'octicons-plain-react/Table';

import features from '../feature-manager.js';
import {selectTab, setNativeTabs, updateCurrentTab, type Tab} from '../components/extensible-nav-store.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';
import ExtensibleNav from './extensible-nav.svelte';

const knownTabsIcons = new Map([
	['code', CodeIcon],
	['issues', IssueOpenedIcon],
	['pull-requests', GitPullRequestIcon],
	['pull-requests-locked', GitPullRequestLockedIcon],
	['agents', AgentIcon],
	['actions', PlayIcon],
	['models', AiModel],
	['wiki', BookIcon],
	['security-and-quality', ShieldIcon],
	['insights', GraphIcon],
	['settings', GearIcon],
	['discussions', CommentDiscussionIcon],
	['projects', TableIcon],
]);

function generateTab(item: HTMLAnchorElement): Tab {
	const label = ($optional('[data-component="text"]', item) ?? item).textContent;
	// Few items have counters. They can also be strings like "5k+" like in microsoft/vscode
	const counter = $optional('[data-component="counter"] [data-variant="secondary"]', item)?.textContent;

	// Hard assertions will make the feature fail before it attempts to replace the native one.
	// Being the repository's main navigation, we want to avoid breaking.
	const itemId = item.getAttribute('data-tab-item');
	assertPresent(itemId);

	// Some tabs swap their icon depending on state
	const lockedPrs = elementExists('[data-component="icon"] svg.octicon-git-pull-request-locked', item);
	const icon = knownTabsIcons.get(lockedPrs ? 'pull-requests-locked' : itemId);
	assertPresent(icon);

	// The tooltip lives in a sibling element, referenced via `aria-describedby`
	const describedBy = item.getAttribute('aria-describedby');
	// Few items have tooltips
	const tooltip = (describedBy && document.getElementById(describedBy)?.textContent) ?? undefined;

	return {
		id: itemId,
		href: item.href,
		reactNav: item.getAttribute('data-react-nav') ?? undefined,
		label,
		icon,
		counter: readable(counter),
		tooltip,
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
High counters https://github.com/microsoft/vscode
Blocked PRs https://github.com/sindresorhus/eslint-plugin-unicorn

*/
