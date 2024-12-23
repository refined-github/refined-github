import {$, $optional} from 'select-dom/strict.js';

import {elementExists} from 'select-dom';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

async function removeFromAppHeader(): Promise<void> {
	$optional('.AppHeader-CopilotChat')?.remove();
}

async function onSearchExpand(): Promise<void> {
	observe('li:has(> ul > li#query-builder-test-result-ask-copilot)', copilot => {
		(copilot.previousElementSibling! as HTMLLIElement).remove();
		copilot!.remove();
	});

	document.removeEventListener('qbsearch-input:expand', onSearchExpand);
}

async function removeFromSearch(): Promise<void> {
	$('qbsearch-input').setAttribute('data-copilot-chat-enabled', 'false');
	document.addEventListener('qbsearch-input:expand', onSearchExpand);
}

void features.add(import.meta.url, {
	include: [
		() => elementExists('.AppHeader-CopilotChat'),
	],
	init: removeFromAppHeader,
}, {
	include: [
		() => elementExists('qbsearch-input'),
	],
	init: removeFromSearch,
});
