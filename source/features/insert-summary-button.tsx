import React from 'dom-chef';
import select from 'select-dom';
import {stripIndent} from 'common-tags';
import features from '../libs/features';
import * as icons from '../libs/icons';

function init() {
	for (const anchor of select.all('md-task-list')) {
		anchor.after(
			<button type="button" class="toolbar-item tooltipped tooltipped-n" onClick={addSummaryDetails} aria-label="Add summary">
				{icons.info()}
			</button>
		);
	}
}

function addSummaryDetails() {
	// Replace selection with <detail>
	document.execCommand('insertText', false, stripIndent`
		<details>
			<summary>Details</summary>
			${getSelection().toString()}
		</details>
	`);
}

features.add({
	id: 'insert-summary-button',
	include: [
		features.isPR,
		features.isIssue,
		features.isNewIssue,
		features.isCompare,
		features.isCommit
	],
	load: features.onAjaxedPages,
	init
});
