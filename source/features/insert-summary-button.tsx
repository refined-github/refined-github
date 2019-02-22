import React from 'dom-chef';
import select from 'select-dom';
import {stripIndents} from 'common-tags';
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

function addSummaryDetails(event) {
	// Don't indent <summary> because indentation will not be automatic on multi-line content
	const newContent = stripIndents`
		<details>
		<summary>Details</summary>
		${getSelection().toString()}
		</details>
	`;

	// Inject new tags; it'll be undoable
	document.execCommand('insertText', false, '\n\n' + newContent + '\n\n');
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
