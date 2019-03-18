import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function splitKeys(keys: string) {
	return keys.split(' ').map(key => <>{' '}<kbd>{key}</kbd></>);
}

function improveShortcutHelp(dialog: Element) {
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

function fixKeys(dialog: Element) {
	for (const key of select.all('kbd', dialog)) {
		if (key.textContent!.includes(' ')) {
			key.replaceWith(...splitKeys(key.textContent as string));
		}
	}
}

// TODO: type target asap and drop `as Element`
const observer = new MutationObserver(([{target}]) => {
	if (!select.exists('.js-details-dialog-spinner', target as Element)) {
		improveShortcutHelp(target as Element);
		fixKeys(target as Element);
		observer.disconnect();
	}
});

function init() {
	document.addEventListener('keypress', ({key}) => {
		if (key === '?') {
			observer.observe(select('.kb-shortcut-dialog')!, {childList: true});
		}
	});
}

features.add({
	id: 'improve-shortcut-help',
	init
});
