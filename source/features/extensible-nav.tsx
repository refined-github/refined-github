import './extensible-nav.css';
import React from 'react';
import * as pageDetect from 'github-url-detection';
import {$, $$, $optional} from 'select-dom';
import elementReady from 'element-ready';

import features from '../feature-manager.js';
import onetime from '../helpers/onetime';

let ready = false;

function generateTab(item: HTMLAnchorElement): JSX.Element {
	const label = ($optional('[data-component="text"]', item) ?? item).textContent;
	// Only a few items have counters
	const counter = $optional('[data-component="counter"] [data-variant="secondary"]', item)?.textContent;
	const selectedClass = item.hasAttribute('aria-current') ? 'selected' : '';

	// The icon may be missing if the feature runs too late and the link is found in the dropdown
	let icon = $optional('[data-component="icon"]', item);
	if (icon) {
		icon = icon.cloneNode(true);
		icon.classList.add(
			// This class comes after d-none utility classes so they can't override it
			'UnderlineNav-octicon',
		);
	}

	return (
		<li key={item.href}>
			<a href={item.href} className={'UnderlineNav-item ' + selectedClass}>
				{icon}
				{label}
				{counter && (
					<span className='Counter'>{counter}</span>
				)}
			</a>
		</li>
	);
}

async function initOnce(): Promise<void> {
	const nativeNav = (await elementReady('nav[aria-label="Repository"]'))!;
	const items = $$('a', nativeNav);
	nativeNav.before(
		<nav className='UnderlineNav rgh-extensible-nav px-4'>
			<ul className='UnderlineNav-body'>
				{items.map(item => generateTab(item))}
			</ul>
		</nav>,
	);

	// nativeNav.classList.add('sr-only');
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
