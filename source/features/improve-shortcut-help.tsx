import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

function splitKeys(keys: string): DocumentFragment[] {
	return keys.split(' ').map(key => <> <kbd>{key}</kbd></>);
}

function improveShortcutHelp(dialog: Element): void {
	select('.Box-body .col-5 .Box:first-child', dialog)!.after(
		<div className="Box Box--condensed m-4">
			<div className="Box-header">
				<h2 className="Box-title">Refined GitHub</h2>
			</div>

			<ul>
				{[...features.shortcutMap].map(([hotkey, description]) => (
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
	if (target instanceof Element && !select.exists('.js-details-dialog-spinner', target)) {
		improveShortcutHelp(target);
		observer.disconnect();
	}
});

function observeShortcutModal({key, target}: KeyboardEvent): void {
	if (key !== '?' || isEditable(target)) {
		return;
	}

	const modal = select('body > details:not(.js-command-palette-dialog) > details-dialog');
	if (modal) {
		observer.observe(modal, {childList: true});
	}
}

function init(): void {
	document.addEventListener('keypress', observeShortcutModal);
}

void features.add(import.meta.url, {
	awaitDomReady: false,
	init: onetime(init),
});
