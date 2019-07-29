import './improve-shortcut-help.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function splitKeys(keys: string): DocumentFragment[] {
	return keys.split(' ').map(key => <> <kbd>{key}</kbd></>);
}

function improveShortcutHelp(dialog: Element): void {
	select('.Box-body .col-5 .Box:first-child', dialog)!.after(
		<div className="Box Box--condensed m-4">
			<div className="Box-header">
				<h3 className="Box-title">Added by Refined GitHub</h3>
			</div>

			<ul>
				{features.getShortcuts().map(({hotkey, description}) => (
					<li className="Box-row d-flex flex-row">
						<div className="flex-auto">{description}</div>
						<div className="ml-2 no-wrap">
							<kbd>{hotkey}</kbd>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

function fixKeys(dialog: Element): void {
	for (const key of select.all('kbd', dialog)) {
		if (key.textContent!.includes(' ')) {
			key.replaceWith(...splitKeys(key.textContent!));
		}
	}
}

const observer = new MutationObserver(([{target}]) => {
	if (target instanceof Element && !select.exists('.js-details-dialog-spinner', target)) {
		improveShortcutHelp(target);
		fixKeys(target);
		observer.disconnect();
	}
});

function init(): void {
	document.addEventListener('keypress', ({key}) => {
		if (key === '?') {
			observer.observe(select('.kb-shortcut-dialog')!, {childList: true});
		}
	});
}

features.add({
	id: __featureName__,
	description: 'Show Refined GitHub’s keyboard shortcuts in the help modal (`?` hotkey)',
	screenshot: 'https://user-images.githubusercontent.com/29176678/36999174-9f07d33e-20bf-11e8-83e3-b3a9908a4b5f.png',
	init
});
