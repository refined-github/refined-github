import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';

function splitKeys(keys) {
	return keys.split(' ').map(key => <>{' '}<kbd>{key}</kbd></>);
}

function improveShortcutHelp(dialog) {
	select('.Box-body .col-5 .Box:first-child', dialog).after(
		<div class="Box Box--condensed m-4">
			<div class="Box-header">
				<h3 class="Box-title">Added by Refined GitHub</h3>
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
			key.replaceWith(...splitKeys(key.textContent));
		}
	}
}

const observer = new MutationObserver(([{target}]) => {
	if (!select.exists('.js-details-dialog-spinner', target as Element)) {
		improveShortcutHelp(target);
		fixKeys(target);
		observer.disconnect();
	}
});

function init() {
	document.addEventListener('keypress', ({key}) => {
		if (key === '?') {
			observer.observe(select('.kb-shortcut-dialog'), {childList: true});
		}
	});
}

features.add({
	id: 'improve-shortcut-help',
	init
});
