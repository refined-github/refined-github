import React from 'react';
import * as pageDetect from 'github-url-detection';

import {$$, $optional} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function regenerate(nativeNav: HTMLElement): void {
	const items = $$('a', nativeNav);
	nativeNav.after(
		<nav className='UnderlineNav px-4'>
			<ul className='UnderlineNav-body'>
				{items.map(item => {
					const label = ($optional('[data-component="text"]', item) ?? item).textContent;
					// Only a few items have counters
					const counter = $optional('[data-component="counter"] [data-variant="secondary"]', item)?.textContent;
					const selectedClass = item.hasAttribute('aria-current') ? 'selected' : '';
					return (
						<li key={item.href}>
							<a href={item.href} className={'UnderlineNav-item ' + selectedClass}>
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
