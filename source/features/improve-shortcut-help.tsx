import './improve-shortcut-help.css';

import React from 'dom-chef';
import {elementExists} from 'select-dom';
import {$, $optional} from 'select-dom/strict.js';
import memoize from 'memoize';

import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';
import {isEditable} from '../helpers/dom-utils.js';
import {shortcutMap} from '../helpers/feature-helpers.js';
import observe from '../helpers/selector-observer.js';

function splitKeys(keys: string): DocumentFragment[] {
	return keys.split(' ').map(key => <> <kbd>{key}</kbd></>);
}

function improveShortcutHelpLegacy(dialog: Element): void {
	$('.Box-body .col-5 .Box:first-child', dialog).after(
		<div className="Box Box--condensed m-4">
			<div className="Box-header">
				<h2 className="Box-title">Refined GitHub</h2>
			</div>

			<ul>
				{[...shortcutMap]
					.toSorted(([, a], [, b]) => a.localeCompare(b))
					.map(([hotkey, description]) => (
						<li className="Box-row d-flex flex-row">
							<div className="flex-auto">{description}</div>
							<div className="ml-2 no-wrap">
								{splitKeys(hotkey)}
							</div>
						</li>
					))}
			</ul>
		</div>,
	);
}

const observer = new MutationObserver(([{target}]) => {
	if (target instanceof Element && !elementExists('.js-details-dialog-spinner', target)) {
		improveShortcutHelpLegacy(target);
		observer.disconnect();
	}
});

function observeShortcutModal({key, target}: KeyboardEvent): void {
	if (key !== '?' || isEditable(target)) {
		return;
	}

	const modal = $optional('body > details:not(.js-command-palette-dialog) > details-dialog');
	if (modal) {
		observer.observe(modal, {childList: true});
	}
}

function initOnce(): void {
	document.body.addEventListener('keypress', observeShortcutModal);
}

// TODO: Remove everything above in 2026
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
	observe('[class^="ShortcutsDialog-module__ColumnsContainer"]', improveShortcutHelp, {signal});
}

void features.add(import.meta.url, {
	init: [init, onetime(initOnce)],
});

void features.addCssFeature(import.meta.url);

/*

Test URLs: Any page

*/
