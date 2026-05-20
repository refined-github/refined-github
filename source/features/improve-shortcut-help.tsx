import './improve-shortcut-help.css';

import React from 'dom-chef';
import memoize from 'memoize';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import {upperCaseFirst} from '../github-helpers/index.js';
import {shortcutMap} from '../helpers/feature-helpers.js';
import observe from '../helpers/selector-observer.js';
import joinJsx from '../helpers/join-jsx.js';

const getRghShortcutsContainer = memoize(
	(baseShortcutsContainer: Element): Element => {
		const rghShortcutsContainer = baseShortcutsContainer.cloneNode(true);
		const shortcutsList = $('ul', rghShortcutsContainer);
		const shortcutItem = $('[class^="ShortcutsGroupList-module__ShortcutItem"]', shortcutsList);
		const keybindingHint = $('kbd', shortcutItem);
		const chord = $('span', shortcutItem);

		$('h2', rghShortcutsContainer).textContent = 'Refined GitHub';
		shortcutsList.replaceChildren(
			...[...shortcutMap]
				.toSorted(([, a], [, b]) => a.localeCompare(b))
				.map(([hotkey, description]) => {
					const keys = hotkey.split(' ').map(key =>
						<span className={chord.className}>
							{upperCaseFirst(key)}
						</span>,
					);
					const currentItem = shortcutItem.cloneNode(true);
					currentItem.firstElementChild!.textContent = description;
					currentItem.lastElementChild!.replaceChildren(
						<kbd className={keybindingHint.className}>
							{joinJsx(' ', keys)}
						</kbd>,
					);
					return currentItem;
				}),
		);

		return rghShortcutsContainer;
	},
	{
		cacheKey: () => location.origin + location.pathname,
	},
);

function improveShortcutHelp(columnsContainer: HTMLElement): void {
	if (shortcutMap.size === 0) {
		features.unload(import.meta.url);
		return;
	}

	const lastColumn = columnsContainer.lastElementChild!;
	lastColumn.append(getRghShortcutsContainer(lastColumn.firstElementChild!));
}

function init(signal: AbortSignal): void {
	observe('div[class^="ShortcutsDialog"][class*="ColumnsContainer"]', improveShortcutHelp, {signal});
}

void features.add(import.meta.url, {
	init,
});

void features.addCssFeature(import.meta.url);

/*

Test URLs: Any page

*/
