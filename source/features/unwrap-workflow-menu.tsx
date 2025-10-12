import * as pageDetect from 'github-url-detection';
import {$, $$, $optional} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import './unwrap-workflow-menu.css';

function unwrapMenu(row: HTMLDivElement): void {
	const details = $('details:has(.octicon-kebab-horizontal)', row);

	const menuItems = $$('li:not(.dropdown-divider)', details);
	details.replaceWith(...menuItems);

	$optional('.d-table-cell.v-align-top', row)?.classList.replace('v-align-top', 'v-align-middle');
}

function init(signal: AbortSignal): void {
	observe('#partial-actions-workflow-runs .Box-row', unwrapMenu, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepositoryActions,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/refined-github/actions

*/
