import {React} from 'dom-chef/react';
import select from 'select-dom';
import domify from '../libs/domify';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';

function splitKeys(keys) {
	return keys.replace(/\S+/g, '<kbd>$&</kbd>');
}

function improveShortcutHelp(dialog) {
	const siteWideShortcutsBox = select(
		'.Box-body .col-5 .Box:first-child',
		dialog
	);

	if (!siteWideShortcutsBox) {
		return;
	}

	siteWideShortcutsBox.after(
		<div class="Box Box--condensed m-4">
			<div class="Box-header">
				<h3 class="Box-title">Refined GitHub shortcuts</h3>
			</div>

			<ul>
				{features.getShortcuts().map(({hotkey, description}) => (
					<li class="Box-row d-flex flex-row">
						<div class="flex-auto">{description}</div>
						<div class="ml-2 no-wrap">
							<kbd>{hotkey}</kbd>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

function fixKeys(dialog) {
	for (const key of select.all('kbd', dialog)) {
		if (key.textContent.includes(' ')) {
			key.replaceWith(domify(splitKeys(key.textContent)));
		}
	}
}

function init() {
	document.addEventListener('keypress', ({key}) => {
		if (key !== '?') {
			return;
		}

		const dialog = select('details > details-dialog.kb-shortcut-dialog');
		observeEl(
			dialog,
			records => {
				const dialogSpinnerGotRemoved = [...records].some(record =>
					[...record.removedNodes].some(element =>
						element.matches('.js-details-dialog-spinner')
					)
				);

				if (dialogSpinnerGotRemoved) {
					improveShortcutHelp(dialog);
					fixKeys(dialog);
				}
			},
			{childList: true}
		);
	});
}

features.add({
	id: 'improve-shortcut-help',
	load: features.onDomReady,
	init
});
