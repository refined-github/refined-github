import React from 'dom-chef';
import {$} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import {shortcutMap} from '../helpers/feature-helpers.js';
import observe from '../helpers/selector-observer.js';

function improveShortcutHelp(columnsContainer: HTMLElement): void {
	const lastColumn = columnsContainer.lastElementChild!;
	const shortcutsContainer = lastColumn.firstElementChild!.cloneNode(true);
	const shortcutsList = $('ul', shortcutsContainer);
	const shortcutItem = $('[class^="ShortcutsGroupList-module__ShortcutItem"]', shortcutsList);
	const keybindingHint = $('kbd', shortcutItem);
	const chord = $('span', shortcutItem);

	$('h2', shortcutsContainer).textContent = 'Refined GitHub';
	shortcutsList.replaceChildren(
		...[...shortcutMap]
			.toSorted(([, a], [, b]) => a.localeCompare(b))
			.map(([hotkey, description]) => {
				const currentItem = shortcutItem.cloneNode(true);
				currentItem.firstElementChild!.textContent = description;
				currentItem.lastElementChild!.replaceChildren(
					<kbd className={keybindingHint.className}>
						{hotkey.split(' ').map((key, index) => (
							<>
								{index > 0 && ' '}
								<span className={chord.className}>
									{key.charAt(0).toUpperCase() + key.slice(1)}
								</span>
							</>
						))}
					</kbd>,
				);
				return currentItem;
			}),
	);

	lastColumn.append(shortcutsContainer);
}

function init(signal: AbortSignal): void {
	observe('[class^="ShortcutsDialog-module__ColumnsContainer"]', improveShortcutHelp, {signal});
}

void features.add(import.meta.url, {
	init,
});

/*

Test URLs: Any page

*/
