import './extensible-nav.css';
import React from 'react';
import * as pageDetect from 'github-url-detection';

import {$$, $optional} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function regenerate(nativeNav: HTMLElement): void {
	const items = $$('a', nativeNav);
	nativeNav.after(
		<nav className='UnderlineNav rgh-extensible-nav px-4'>
			<ul className='UnderlineNav-body'>
				{items.map(item => {
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
				})}
			</ul>
		</nav>,
	);

	nativeNav.classList.add('sr-only');
}

function init(signal: AbortSignal): void {
	observe('nav[aria-label="Repository"]', regenerate, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/pulse

*/
